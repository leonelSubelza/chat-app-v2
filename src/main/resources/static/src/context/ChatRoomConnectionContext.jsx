import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { userContext, useUserDataContext } from './UserDataContext';
import { generateUserId } from '../utils/IdGenerator';
import { createMessageJoin, createPrivateMessage, createPublicMessage, createUserChat, resetValues, updateChatData } from '../components/ChatRoom/ChatRoomFunctions.js';
import { useNavigate } from 'react-router-dom';

/*
Stomp es una biblioteca JavaScript que se utiliza para enviar y recibir 
mensajes a través del protocolo STOMP (Simple Text Oriented Messaging Protocol).
*/
import { over } from 'stompjs';
//Es una librearia de JS. A diferencia de usar la api WebSocket para crear la conexion,
//Esta sirve para que pueda ser usada en navegadores más viejos.
import SockJS from 'sockjs-client';
import { serverURL } from '../config/chatConfiguration.js';

export const chatRoomConnectionContext = React.createContext();

export function useChatRoomConnectionContext() {
    return useContext(chatRoomConnectionContext);
}

export function ChatRoomConnectionContext({ children }) {
    const navigate = useNavigate();
    //flag para que no ejecute el método connect() más de una vez
    const startedConnection = useRef(false);

    const userDataContext = useUserDataContext();

    const { setChannelExists, userData, setUserData, stompClient, loadUserDataValues,
        chats, setChats, tab } = useContext(userContext)


    //Esto lo tuve que hacer porque no sabía como hacer que la funcion onMessageReceived y onPrivateMessage
    //obtengan en sus funciones valores de los estados actualizados. Se define la funcion y se quedan los valores
    //guardados de la primera vez que se carga la función.
    const [receivedMessageUserTyping,setReceivedMessageUserTyping] = useState({
        received:false,
        receivedInPublicMessage:false,
        payloadData:null
    });
    const [chatUserTyping, setChatUserTyping] = useState({
        'isChatUserTyping': false,
        'chatUser': null,
        'isPublicMessage': false
    });

    const disconnectChat = () => {
        if (stompClient.current !== null && Object.keys(stompClient.current.subscriptions).length > 0) {
            //se desuscribe de todos los canales
            Object.keys(stompClient.current.subscriptions).forEach((s) => stompClient.current.unsubscribe(s));
            resetValues(userDataContext);
        }
    };

    const startServerConnection = () => {
        if (startedConnection.current) {
            return;
        }
        if (stompClient.current === null && !startedConnection.current) {
            startedConnection.current = true;
            let Sock = new SockJS(serverURL);
            stompClient.current = over(Sock);
            //stompClient.current.debug = null
            stompClient.current.connect({}, onConnected, onError);
        }
    }

    const onConnected = () => {
        userData.connected = true
        setUserData({ ...userData });
    }

    const onError = (err) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        disconnectChat()
        navigate('/')
    }

    const checkIfChannelExists = (roomId) => {
        stompClient.current.subscribe('/user/' + userData.userId + '/exists-channel', (payload) => {
            var payloadData = JSON.parse(payload.body);
            if ((payloadData.status === 'EXISTS' && userData.status === 'CREATE')) {
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat();
                navigate('/');
                return;
            }
            if ((payloadData.status === 'NOT_EXISTS' && userData.status === 'JOIN')) {
                alert('el canal al que se intenta conectar no existe');
                disconnectChat();
                navigate('/');
                return;
            }
            setChannelExists(true);
            subscribeRoomChannels(roomId);
            userJoin(roomId);
            navigate(`/chatroom/${roomId}`);
        });

        var chatMessage = {
            senderId: userData.userId,
            senderName: userData.username,
            urlSessionId: roomId,
        };
        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))
    }

    const subscribeRoomChannels = (roomId) => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + roomId, onMessageReceived);
        stompClient.current.subscribe(
            '/user/' + userData.userId + "/" + roomId + '/private', onPrivateMessage);
    }

    const userJoin = (roomId) => {
        let userDataAux = userData;
        userDataAux.URLSessionid = roomId;
        //despues fijarse si se carga bien el url session id asi no hago esta variable 

        //aca el status puede ser CREATE o JOIN depende
        var chatMessage = createPublicMessage(userData.status, userDataAux);
        stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                handleJoinUser(payloadData, true);
                break;
            case "MESSAGE":
                savePublicMessage(payloadData);
                break;
            case "UPDATE":
                let userToUpdate = getUserSavedFromChats(payloadData.senderId);
                if (userToUpdate) {
                    updateChatData(payloadData, userDataContext, userToUpdate);
                }
                break;
            case "LEAVE":
                console.log("se recibe msj de que alguien se desconectó ⬅︎");
                handleUserLeave(payloadData);
                break;
            case "WRITING":
                setReceivedMessageUserTyping({
                    received:true,
                    receivedInPublicMessage:true,
                    payloadData:payloadData
                })
                
                // if (payloadData.senderId !== userData.userId
                //     && tab.username === 'CHATROOM') {
                //     setUserWriting(payloadData,true);
                // }
                break;
            case "ERROR":
                alert('Error conectando al chat. Nose que pudo haber sido, se enviaron mal los datos xD');
                //Por las dudas si se genero mal el id que se haga uno nuevo 
                setUserData({ ...userData, 'userId': generateUserId() });
                disconnectChat()
                navigate('/');
                break;
            default:
                break;
        }
    };

    const onPrivateMessage = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                //Los usuarios que no conzco me dicen quienes son uwu
                handleJoinUser(payloadData, false);
                break;
            case "MESSAGE":
                handlePrivateMessageReceived(payloadData);
                break;
            case 'WRITING':
                setReceivedMessageUserTyping({
                    received:true,
                    receivedInPublicMessage:false,
                    payloadData:payloadData
                })
                
                // if (payloadData.senderId !== userData.userId
                //     && tab.username !== 'CHATROOM') {
                //     setUserWriting(payloadData,false);
                // }
                break;
            default:
                break;
        }
    };

    const handleJoinUser = (payloadData, resend) => {
        if (payloadData.senderId === userData.userId) {
            return;
        }
        let userSaved = getUserSavedFromChats(payloadData.senderId);
        if (!chats.get(userSaved)) {
            var chatUser = createUserChat(payloadData);
            chats.set(chatUser, []);
            setChats(new Map(chats));
            if (resend) {
                //Generamos el msj de que alguien se unió
                let joinMessage = createMessageJoin("JOIN", payloadData);

                savePublicMessage(joinMessage);

                let roomId = userData.URLSessionid === '' ? payloadData.urlSessionId : userData.URLSessionid;
                let userDataAux = userData;
                userDataAux.URLSessionid = roomId;
                var chatMessage = createPrivateMessage('JOIN', userDataAux, payloadData.senderName, payloadData.senderId);
                stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            }
        }
    }

    const savePublicMessage = (payloadData) => {
        let chatRoomElement = Array.from(chats.keys())[0];
        chatRoomElement.hasUnreadedMessages = true;
        chats.get(chatRoomElement).push(payloadData);
        setChats(new Map(chats));
    };

    const handlePrivateMessageReceived = (payloadData) => {
        let userSaved = getUserSavedFromChats(payloadData.senderId)
        if (userSaved) {
            Array.from(chats.keys()).find(c => c.id === userSaved.id).hasUnreadedMessages = true;
            chats.get(userSaved).push(payloadData);
            setChats(new Map(chats));
        } else {
            //esto no debería pasar porque el usuario se guarda cuando se une al chat
            console.log("no se tenia un obj privado guardado");
            // var chatUser = createUserChat(payloadData);
            // let list = [];
            // list.push(payloadData);
            // chatUser.hasUnreadedMessages = true;
            // chats.set(chatUser, list);
            // setChats(new Map(chats));
        }
    }

    const handleUserLeave = (payloadData) => {
        if (payloadData.senderId === userData.userId) {
            return;
        }
        let joinMessage = createMessageJoin("LEAVE", payloadData);
        savePublicMessage(joinMessage)

        let userSaved = getUserSavedFromChats(payloadData.senderId);
        chats.delete(userSaved);
        setChats(new Map(chats));
    }

    const setUserWriting = (payloadData,isPublicMessage) =>{
        let userWriting = getUserSavedFromChats(payloadData.senderId);
        setChatUserTyping({
            'isChatUserTyping': true,
            'chatUser': userWriting,
            'isPublicMessage': isPublicMessage
        });
        setTimeout(() => {
            setChatUserTyping({'isChatUserTyping': false, 'chatUser': null });
        }, 3000)
    }

    const getUserSavedFromChats = (id) => {
        return Array.from(chats.keys()).find(k => k.id === id)
    }


//FALTA ARREGLAR QUE NO DESAPAREZCA LOS CHATS CUANDO GUARDO

    useEffect(() => {
        //COSO PARA MARCAR MSJ NO LEIDO
        console.log(chats);
        console.log("-------------");
        let unreadChat = Array.from(chats.keys()).find(c => c.hasUnreadedMessages);
        if (unreadChat === undefined || tab === undefined) {
            return;
        }
        if (tab.id === unreadChat.id) {
            Array.from(chats.keys()).find(c => c.id === unreadChat.id).hasUnreadedMessages = false;
            setChats(new Map(chats))
        }
        
    }, [chats])

    useEffect(()=>{
        if(receivedMessageUserTyping.received){
            if(receivedMessageUserTyping.receivedInPublicMessage){
                setUserWriting(receivedMessageUserTyping.payloadData,true);
            }else{
                setUserWriting(receivedMessageUserTyping.payloadData,false);
            }
            setReceivedMessageUserTyping({
                received:false,
                receivedInPublicMessage:false,
                payloadData:null
            })
            
        }
    },[receivedMessageUserTyping,setReceivedMessageUserTyping])

    useEffect(() => {
        loadUserDataValues();
        startServerConnection();
    }, []);

    return (
        <chatRoomConnectionContext.Provider
            value={{
                disconnectChat,
                checkIfChannelExists,
                startServerConnection,
                startedConnection,
                chatUserTyping
            }}
        >
            {children}
        </chatRoomConnectionContext.Provider>
    )
}