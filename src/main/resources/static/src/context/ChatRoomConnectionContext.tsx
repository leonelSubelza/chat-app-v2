import type { ChatRoomConnectionContextType, UserData, UserDataContextType } from './types/types.ts';
import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { userContext, useUserDataContext } from './UserDataContext.tsx';
import { createMessageJoin, createPrivateMessage, createPublicMessage, createUserChat, resetValues, updateChatData } from '../components/ChatRoom/ChatRoomFunctions.ts';
import { useNavigate } from 'react-router-dom';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { serverURL } from '../config/chatConfiguration.ts';
import { MessagesStatus } from '../components/interfaces/messages.status.ts';
import { Message } from '../components/interfaces/messages.ts';
import { getActualDate } from '../utils/MessageDateConvertor.ts';
import { ChatUserRole, UserChat } from '../components/interfaces/chatRoom.types.ts';

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
        chats, setChats, tab, setTab,
        bannedUsers, setBannedUsers } = useContext(userContext) as UserDataContextType;

    const [chatUserTyping,setChatUserTyping] = useState<Map<UserChat,boolean>>(undefined);

    const disconnectChat = (notifyOthers: boolean):void => {
        if(notifyOthers){
            let leaveMessage: Message = createPublicMessage(MessagesStatus.LEAVE,userData);
            stompClient.current.send("/app/user.disconnected",{},JSON.stringify(leaveMessage));
        }
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
        disconnectChat(false);
        navigate('/')
    }

    //si la room no existe, se procede a crear una, si si existe te desconecto
    const checkIfChannelExists = (): void => {
        stompClient.current.subscribe('/user/' + userData.id + '/exists-channel', (payload: any) => {
            var message: Message = JSON.parse(payload.body);
            if(message.status === MessagesStatus.ALREADY_CONNECTED){
                alert('Ya se encuentra conectado a esta sala!');
                disconnectChat(false);
                navigate('/');
                return;
            }
            if ((message.status === MessagesStatus.EXISTS && userData.status === MessagesStatus.CREATE)) {
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat(false);
                navigate('/');
                return;
            }
            if ((message.status === MessagesStatus.NOT_EXISTS && userData.status === MessagesStatus.JOIN)) {
                alert('el canal al que se intenta conectar no existe');
                disconnectChat(false);
                navigate('/');
                return;
            }
            if( message.status === MessagesStatus.ERROR) {
                alert(message.message);
                disconnectChat(false);
                navigate('/');
                return;
            }

            //Me desuscribo a este canal para que no rompa las bolas
            let channelsSusbribed = Object.keys(stompClient.current.subscriptions)
            let latestChannelSubscribed = channelsSusbribed[ channelsSusbribed.length-1 ];
            stompClient.current.unsubscribe(latestChannelSubscribed);
            
            setChannelExists(true);
            subscribeRoomChannels();
            userJoin();
            navigate(`/chatroom/${userData.urlSessionid}`);
        });
        
        var chatMessage: Message = {
            senderId: userData.id,
            senderName: userData.username,
            date: getActualDate(),
            status: userData.status,
            urlSessionId: userData.urlSessionid
        }
        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))
    }

    const subscribeRoomChannels = () => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + userData.urlSessionid, onMessageReceived);
        stompClient.current.subscribe(
            '/user/' + userData.id + "/" + userData.urlSessionid + '/private', onPrivateMessage);
    }

    const userJoin = () => {
        var chatMessage: Message = createPublicMessage(userData.status, userData);
        stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
    }

    //Acá no se pregunta si se es admin o no porque es un proceso ya hecho en el servidor
    const handleUserBanned = (message:Message) => {
        if(message.status === MessagesStatus.BAN){
            //si me banean a mi
            if(message.receiverId === userData.id) {
                alert(message.senderName+" has banned you from this room!");
                disconnectChat(false);
                navigate('/');
                return;
            }
            
            //Alguien(puedo ser yo) banea a alguien
            let userToBan:UserChat = getUserSavedFromChats(message.receiverId);
            if (Array.from(chats.keys()).includes(userToBan)) {
                chats.delete(userToBan);
                bannedUsers.push(userToBan);
                setChats(new Map(chats))
                setBannedUsers(bannedUsers);
                console.log("se banea a "+userToBan.username);
            }
        }
        if(message.status === MessagesStatus.UNBAN){
            let userToUnBan:UserChat = bannedUsers.find( (u:UserChat) => u.id === message.receiverId);
            if (userToUnBan!==null) {
                let bannedUsersAux = bannedUsers.filter( (u:UserChat) => u.id !== userToUnBan.id);
                chats.set(userToUnBan,new Array<Message>);
                setChats(new Map(chats))
                setBannedUsers(bannedUsersAux);
                console.log("se desbanea a "+userToUnBan.username);
                alert(message.senderName+" has unbanned you from the room!");
            }
        }
    }

    const handleMakeAdmin = (message:Message) => {
        //yo era admin, ahora convierto a alguien en admin
        if(message.senderId === userData.id){
            let userToMakeAdmin:UserChat = getUserSavedFromChats(message.receiverId);
            userData.chatRole = ChatUserRole.CLIENT;
            userToMakeAdmin.chatRole = ChatUserRole.ADMIN
            alert(message.receiverName+' is the new admin!');
        }
        //Un admin me convierte a mi en admin 😎        
        if(message.receiverId === userData.id){
            let userToHandle:UserChat = getUserSavedFromChats(message.senderId);
            //Si es undefined significa que es el caso en el que el admin abandona la room
            if(userToHandle!==undefined){
                userToHandle.chatRole = ChatUserRole.CLIENT
            }
            userData.chatRole = ChatUserRole.ADMIN;
            alert(message.senderName+' has made you the new admin!');
        }
        //Alguien que es admin convierte a otro en admin
        if(message.senderId!==userData.id && message.receiverId!==userData.id){
            let userToMakeAdmin = getUserSavedFromChats(message.receiverId);
            let userToMakeClient = getUserSavedFromChats(message.senderId);
            if(userToMakeClient!==undefined){
                userToMakeClient.chatRole = ChatUserRole.CLIENT;
            }
            if(userToMakeAdmin===undefined){
                alert('Se intenta convertir en admin a alguien que no esta en la sala')
            }
            userToMakeAdmin.chatRole = ChatUserRole.ADMIN;
            alert(message.receiverName+' is the new admin!');
        }
        setUserData(userData);
        setChats(new Map(chats));
    }

    const handleUserWriting = (message:Message,isPublicMessage:boolean) => {
        if(message.senderId !== userData.id){
            //Si recibo un msj de escribiendo de una persona
            let senderUser: UserChat;
            if(isPublicMessage){
                senderUser = getUserSavedFromChats('0');
                senderUser.writingName = message.senderName;
                if(senderUser.isWriting && message.status === MessagesStatus.WRITING
                    && message.senderId !== senderUser.id){
                    senderUser.writingName = 'A lot of people';
                }
            }else{
                senderUser = getUserSavedFromChats(message.senderId);
            }
            senderUser.isWriting = message.status===MessagesStatus.WRITING ? true : false;
            console.log("me llega una notf de que "+message.senderName+" isWritng: "+message.status===MessagesStatus.WRITING);
            if(tab.id === message.senderId){
                tab.isWriting = message.status===MessagesStatus.WRITING;
                setTab(tab)
            }
            chats.set(senderUser,chats.get(senderUser));
            setChats(new Map(chats));
        }
    }

    const onMessageReceived = (payload: any) => {
        var message: Message = JSON.parse(payload.body);
        switch (message.status) {
            case MessagesStatus.JOIN:
                handleJoinUser(message, true);
                // scrollToBottom();
                break;
            case MessagesStatus.MESSAGE:
                savePublicMessage(message);
                // scrollToBottom();
                break;
            case MessagesStatus.UPDATE:
                let userToUpdate: UserChat = getUserSavedFromChats(message.senderId);
                if (userToUpdate) {
                    updateChatData(message, userDataContext, userToUpdate);
                }
                break;
            case MessagesStatus.LEAVE:
                handleUserLeave(message);
                // scrollToBottom();
                break;
            case MessagesStatus.STOP_WRITING:
            case MessagesStatus.WRITING :
                handleUserWriting(message,true);
                break;
            case MessagesStatus.BAN:
                handleUserBanned(message);
                break;
            case MessagesStatus.UNBAN:
                handleUserBanned(message);
                break;
            case MessagesStatus.MAKE_ADMIN:
                handleMakeAdmin(message);
                break;
            case MessagesStatus.ERROR:
                alert('Se ha producido un error. '+message.message);
                // disconnectChat(true)
                // navigate('/');
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
                // scrollToBottom();
                break;
            case MessagesStatus.MESSAGE:
                handlePrivateMessageReceived(message);
                // scrollToBottom();
                break;
                case MessagesStatus.STOP_WRITING:
                case MessagesStatus.WRITING :
                    handleUserWriting(message,false);
                    break;
            default:
                break;
        }
    };

    const handleJoinUser = (message: Message, resend:boolean) => {
        if (message.senderId === userData.id) {
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

                let roomId: string = userData.urlSessionid === '' ? message.urlSessionId : userData.urlSessionid;
                let userDataAux: UserData = userData;
                userDataAux.urlSessionid = roomId;
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
        }
    }

    const handleUserLeave = (message: Message) => {
        if (message.senderId === userData.id) {
            return;
        }
        let joinMessage: Message = createMessageJoin(MessagesStatus.LEAVE, message);
        savePublicMessage(joinMessage);

        let userSaved: UserChat = getUserSavedFromChats(message.senderId);
        chats.delete(userSaved);
        setChats(new Map(chats));
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
            //COSO PARA PONER EL SCROLL AL FINAL CUANDO LLEGA UN MSJ
            const chatContainer = document.querySelector(".scroll-messages");
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }        
        
    }, [chats])

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