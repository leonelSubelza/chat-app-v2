import type { ChatRoomConnectionContextType, ChatUserTypingType, MessageUserTyping, PayloadData, UserData, UserDataContextType } from './types/types.js';
import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { userContext, useUserDataContext } from './UserDataContext.js';
import { generateUserId } from '../utils/IdGenerator.js';
import { createMessageJoin, createPrivateMessage, createPublicMessage, createUserChat, resetValues, updateChatData } from '../components/ChatRoom/ChatRoomFunctions.js';
import { useNavigate } from 'react-router-dom';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { serverURL } from '../config/chatConfiguration.js';
import { MessagesStatus } from '../components/interfaces/messages.status.js';
import { Message } from '../components/interfaces/messages.js';
import { getActualDate } from '../utils/MessageDateConvertor.js';
import { UserChat } from '../components/interfaces/chatRoom.types.js';


export const chatRoomConnectionContext = React.createContext<ChatRoomConnectionContextType>(undefined);

export function useChatRoomConnectionContext(): ChatRoomConnectionContextType{
    return useContext(chatRoomConnectionContext);
}

interface ChatRoomConnectionProviderProps {
    children: ReactNode;
  }

export function ChatRoomConnectionContext({ children }: ChatRoomConnectionProviderProps) {
    const navigate = useNavigate();
    //flag para que no ejecute el método connect() más de una vez
    const startedConnection = useRef<boolean>(false);

    const userDataContext: UserDataContextType = useUserDataContext();

    const { setChannelExists, userData, setUserData, stompClient, loadUserDataValues,
        chats, setChats, tab } = useContext(userContext) as UserDataContextType;


    //Esto lo tuve que hacer porque no sabía como hacer que la funcion onMessageReceived y onPrivateMessage
    //obtengan en sus funciones valores de los estados actualizados. Se define la funcion y se quedan los valores
    //guardados de la primera vez que se carga la función.
    const [receivedMessageUserTyping,setReceivedMessageUserTyping] = useState<MessageUserTyping>({
        received:false,
        receivedInPublicMessage:false,
        payloadData:null
    });
    const [chatUserTyping, setChatUserTyping] = useState<ChatUserTypingType>({
        isChatUserTyping: false,
        chatUser: null,
        isPublicMessage: false
    });

    const disconnectChat = ():void => {
        if (stompClient.current !== null && Object.keys(stompClient.current.subscriptions).length > 0) {
            //se desuscribe de todos los canales
            Object.keys(stompClient.current.subscriptions).forEach((s) => stompClient.current.unsubscribe(s));
            resetValues(userDataContext);
        }
    };

    const startServerConnection = (): void => {
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

    const onConnected = ():void => {
        userData.connected = true
        setUserData({ ...userData });
    }

    const onError = (err: unknown) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        disconnectChat()
        navigate('/')
    }

    const checkIfChannelExists = (): void => {
        stompClient.current.subscribe('/user/' + userData.userId + '/exists-channel', (payload: any) => {
            var message: Message = JSON.parse(payload.body);
            if ((message.status === MessagesStatus.EXISTS && userData.status === MessagesStatus.CREATE)) {
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat();
                navigate('/');
                return;
            }
            if ((message.status === MessagesStatus.NOT_EXISTS && userData.status === MessagesStatus.JOIN)) {
                alert('el canal al que se intenta conectar no existe');
                disconnectChat();
                navigate('/');
                return;
            }
            setChannelExists(true);
            subscribeRoomChannels();
            userJoin();
            navigate(`/chatroom/${userData.URLSessionid}`);
        });
        
        var chatMessage: Message = {
            senderId: userData.userId,
            senderName: userData.username,
            date: getActualDate(),
            status: userData.status,
            urlSessionId: userData.URLSessionid
        }
        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))
    }

    const subscribeRoomChannels = () => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + userData.URLSessionid, onMessageReceived);
        stompClient.current.subscribe(
            '/user/' + userData.userId + "/" + userData.URLSessionid + '/private', onPrivateMessage);
    }

    const userJoin = () => {
        var chatMessage: Message = createPublicMessage(userData.status, userData);
        stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload: any) => {
        var message: Message = JSON.parse(payload.body);
        switch (message.status) {
            case MessagesStatus.JOIN:
                handleJoinUser(message, true);
                break;
            case MessagesStatus.MESSAGE:
                savePublicMessage(message);
                break;
            case MessagesStatus.UPDATE:
                let userToUpdate: UserChat = getUserSavedFromChats(message.senderId);
                if (userToUpdate) {
                    updateChatData(message, userDataContext, userToUpdate);
                }
                break;
            case MessagesStatus.LEAVE:
                console.log("se recibe msj de que alguien se desconectó ⬅︎");
                handleUserLeave(message);
                break;
            case MessagesStatus.WRITING:
                setReceivedMessageUserTyping({
                    received:true,
                    receivedInPublicMessage:true,
                    payloadData:message
                })
                break;
            case MessagesStatus.ERROR:
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

    const onPrivateMessage = (payload: any) => {
        var message: Message = JSON.parse(payload.body);
        switch (message.status) {
            case MessagesStatus.JOIN:
                //Los usuarios que no conzco me dicen quienes son uwu
                handleJoinUser(message, false);
                break;
            case MessagesStatus.MESSAGE:
                handlePrivateMessageReceived(message);
                break;
            case MessagesStatus.WRITING:
                setReceivedMessageUserTyping({
                    received:true,
                    receivedInPublicMessage:false,
                    payloadData:message
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

    const handleJoinUser = (message: Message, resend:boolean) => {
        if (message.senderId === userData.userId) {
            return;
        }
        let userSaved: UserChat = getUserSavedFromChats(message.senderId);
        if (!chats.get(userSaved)) {
            var chatUser: UserChat = createUserChat(message);
            chats.set(chatUser, new Array<Message>);
            setChats(new Map(chats));
            if (resend) {
                //Generamos el msj de que alguien se unió
                let joinMessage: Message = createMessageJoin(MessagesStatus.JOIN, message);

                savePublicMessage(joinMessage);

                let roomId: string = userData.URLSessionid === '' ? message.urlSessionId : userData.URLSessionid;
                let userDataAux: UserData = userData;
                userDataAux.URLSessionid = roomId;
                var chatMessage: Message = createPrivateMessage(
                    MessagesStatus.JOIN, userDataAux, message.senderName, message.senderId);
                stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            }
        }
    }

    const saveMessage = (user: UserChat, message: Message)=>{
        const updatedChats: Map<UserChat, Message[]> = new Map(chats);
        const currentMessages: Message[]= updatedChats.get(user) || new Array<Message>;
        const updatedMessages: Message[] = [...currentMessages, message];
        updatedChats.set(user, updatedMessages);
        chats.set(user, updatedMessages);
        setChats(new Map(updatedChats));
    }

    const savePublicMessage = (message: Message) => {
        let chatRoomElement: UserChat = Array.from(chats.keys())[0];
        chatRoomElement.hasUnreadedMessages = true;  
        saveMessage(chatRoomElement,message);
    };

    const handlePrivateMessageReceived = (message: Message) => {
        let userSaved: UserChat = getUserSavedFromChats(message.senderId)
        if (userSaved) {
            Array.from(chats.keys())!.find(c => c.id === userSaved.id)!.hasUnreadedMessages = true;
            saveMessage(userSaved,message);
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

    const handleUserLeave = (message: Message) => {
        if (message.senderId === userData.userId) {
            return;
        }
        let joinMessage: Message = createMessageJoin(MessagesStatus.LEAVE, message);
        savePublicMessage(joinMessage);

        let userSaved: UserChat = getUserSavedFromChats(message.senderId);
        chats.delete(userSaved);
        setChats(new Map(chats));
    }

    const setUserWriting = (message: Message, isPublicMessage: boolean) =>{
        let userWriting = getUserSavedFromChats(message.senderId);
        setChatUserTyping({
            'isChatUserTyping': true,
            'chatUser': userWriting,
            'isPublicMessage': isPublicMessage
        });
        setTimeout(() => {
            setChatUserTyping({
                'isChatUserTyping': false, 
                'chatUser': null,
             });
        }, 3000)
    }

    const getUserSavedFromChats = (id: string): UserChat => {
        return Array.from(chats.keys()).find(k => k.id === id)!;
    }

    useEffect(() => {
        //COSO PARA MARCAR MSJ NO LEIDO
        let unreadChat: UserChat = Array.from(chats.keys())!.find(c => c.hasUnreadedMessages)!;
        if (unreadChat === undefined || tab === undefined) {
            return;
        }
        if (tab.id === unreadChat.id) {
            Array.from(chats.keys())!.find(c => c.id === unreadChat.id)!.hasUnreadedMessages = false;
            setChats(new Map(chats))
        }        
    }, [chats])

    useEffect(()=>{
        if(receivedMessageUserTyping.received){
            if(receivedMessageUserTyping.receivedInPublicMessage){
                setUserWriting(receivedMessageUserTyping.payloadData!,true);
            }else{
                setUserWriting(receivedMessageUserTyping.payloadData!,false);
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