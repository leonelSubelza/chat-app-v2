import React, { useContext, useEffect,useRef } from 'react'
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

    const { channelExists, setChannelExists,
        userData, setUserData,
        privateChats, setPrivateChats,
        publicChats, setPublicChats,
        stompClient,loadUserDataValues } = useContext(userContext)


    const disconnectChat = () => {
        if (stompClient.current !== null && Object.keys(stompClient.current.subscriptions).length>0) {
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
            //     console.log("se conecta");
            startedConnection.current = true;
            let Sock = new SockJS(serverURL);
            stompClient.current = over(Sock);
            stompClient.current.connect({}, onConnected, onError);
        }
    }

    const onConnected = () => {
        userData.connected = true
        setUserData({ ...userData});
    }

    const onError = (err) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        //se vuelve a la pagina de registro:
        disconnectChat()
        navigate('/')
    }

    const checkIfChannelExists = (roomId) => {
        console.log(stompClient);
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
            //setUserData({ ...userData, "userId": payloadData.senderId });
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
        stompClient.current.subscribe('/user/' + userData.userId + "/" + roomId + '/private', onPrivateMessage);
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
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            case "UPDATE":
                //actualizar publicMessages y privateMessages
                let userToUpdate = getUserSavedFromPrivateMenssage(payloadData.senderId);
                if (userToUpdate) {
                    updateChatData(payloadData, userDataContext, userToUpdate);
                }
                break;
            case "LEAVE":
                handleUserLeave(payloadData);
                break;
            case "ERROR":
                alert('Error conectando al chat. Nose que pudo haber sido, se enviaron mal los datos xD');
                //Por las dudas si se genero mal el id que se haga uno nuevo :,(
                setUserData({ ...userData, 'userId': generateUserId() });
                disconnectChat()
                navigate('/');
                break;
            default:
                break;
        }
    }

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
            default:
                break;
        }
    }

    const handleJoinUser = (payloadData, resend) => {
        //si soy yo mismo
        if (payloadData.senderName === userData.username) {
            return;
        }
        //Si no se tiene guardado quien se unio se guarda (tambien nos llega un msj de que este cliente mismo se unio)
        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId);
        if (!privateChats.get(userSaved)) {
            var chatUser = createUserChat(payloadData);
            privateChats.set(chatUser, []);
            setPrivateChats(new Map(privateChats));
            if (resend) {
                //Generamos el msj de que alguien se unió
                let joinMessage = createMessageJoin("JOIN", payloadData);
                publicChats.push(joinMessage);
                setPublicChats([...publicChats]);

                //la poronga del urlSessionId no se por qué concha puta no se guarda
                let roomId = userData.URLSessionid === '' ? payloadData.urlSessionId : userData.URLSessionid;
                let userDataAux = userData;
                userDataAux.URLSessionid = roomId;
                var chatMessage = createPrivateMessage('JOIN', userDataAux, payloadData.senderName, payloadData.senderId);
                stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            }
        }
    }

    const getUserSavedFromPrivateMenssage = (id) => {
        for (var obj of privateChats) {
            if (id === obj[0].id) {
                return obj[0];
            }
        }
        return undefined;
    }

    const handlePrivateMessageReceived = (payloadData) => {
        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId, privateChats)
        //privateChats.get(payloadData.senderName)
        if (userSaved) {
            privateChats.get(userSaved).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            var chatUser = createUserChat(payloadData);
            let list = [];
            list.push(payloadData);
            privateChats.set(chatUser, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const handleUserLeave = (payloadData) => {
        if (payloadData.senderId === userData.userId) {
            //si yo mismo me voy
            return;
        }
        //mostramos msj de que alguien se fue
        let joinMessage = createMessageJoin("LEAVE", payloadData);
        publicChats.push(joinMessage);
        setPublicChats([...publicChats]);

        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId)
        privateChats.delete(userSaved);
        setPrivateChats(new Map(privateChats));
    }

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
                startedConnection
            }}
        >
            {children}
        </chatRoomConnectionContext.Provider>
    )
}