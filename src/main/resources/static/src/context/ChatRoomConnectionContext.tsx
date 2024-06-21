import type { ChatRoomConnectionContextType, UserData, UserDataContextType, UserDataSaveLocalStorage } from './types/types.ts';
import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { userContext, useUserDataContext } from './UserDataContext.tsx';
import { createMessageJoin, createPrivateMessage, createPublicMessage, createUserChat, resetValues, updateChatData } from '../components/ChatRoom/ChatRoomFunctions.ts';
import { useNavigate } from 'react-router-dom';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { serverURL, webSiteChatURL, webSiteBaseURL } from '../config/chatConfiguration.ts';
import { MessagesStatus } from '../components/interfaces/messages.status.ts';
import { Message } from '../components/interfaces/messages.ts';
import { getActualDate } from '../utils/MessageDateConvertor.ts';
import { ChatUserRole, UserChat } from '../components/interfaces/chatRoom.types.ts';
import { isAuthenticationExpired, isTokenInvalid, startAuthentication } from '../auth/authenticationCreator.ts';
import { ChatPaths } from '../config/chatConfiguration.ts';
import {Spinner} from "react-bootstrap";

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

    //flag para saber si hay que hacer f5
    const lostConnection = useRef<boolean>(false);

    const userDataContext: UserDataContextType = useUserDataContext();

    const { isDataLoading,setChannelExists, userData, setUserData, stompClient, loadUserDataValues,
        chats, setChats, tab, setTab, tokenJwt,setTokenJwt,
        bannedUsers, setBannedUsers } = useContext(userContext) as UserDataContextType;

    const disconnectChat = (notifyOthers: boolean):void => {
        if(notifyOthers){
            let leaveMessage: Message = createPublicMessage(MessagesStatus.LEAVE,userData);
            sendMessage(leaveMessage,ChatPaths.USER_DISCONNECTED)
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
            let token = localStorage.getItem('tokenJwt');
            let Sock = new SockJS(serverURL);
            stompClient.current = over(Sock);
            // stompClient.current.debug = null
            stompClient.current.connect({Authorization: `Bearer ${token}`}, onConnected, onError);
        }
    }

    const onConnected = ():void => {
        userData.connected = true

        if(stompClient.current!==null && stompClient.current.subscriptions){
            stompClient.current.subscribe('/chatroom/public', (payload: any)=>{
              let message: Message = JSON.parse(payload.body);
              // console.log(message);
          });
          }

        setUserData({ ...userData });
    }

    const onError = (error: unknown) => {
        //Si hay un error simplemente volvemos a authenticar en la app. El error mayor es si
        //la auth también falla, ahi si se cae el sist
        let err = error.toString();
        console.log("Error conectando al wb: " + err+", se renueva el token");
        // startedConnection.current = false;
        // stompClient.current = null;
        // localStorage.setItem("tokenJwt",null)
        // startApplication();
    }

    //si la room no existe, se procede a crear una, si si existe te desconecto
    const checkIfChannelExists = (): void => {
        stompClient.current.subscribe('/user/' + userData.id + '/exists-channel', (payload: any) => {
            let message: Message = JSON.parse(payload.body);
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

            //Me desuscribo a este canal por el tema de evitar doble conexion
            //Si ya estaba conectado a esta sala, el servidor me avisará por este canal y  el msj
            //solo me llegará a la version duplicada y no al que ya esta conectado
            let channelsSuscribed = Object.keys(stompClient.current.subscriptions)
            let latestChannelSubscribed = channelsSuscribed[ channelsSuscribed.length-1 ];
            stompClient.current.unsubscribe(latestChannelSubscribed);
            
            setChannelExists(true);
            subscribeRoomChannels();
            userJoin();
            // navigate(`/chat-app-v2/chatroom/${userData.urlSessionid}`);
            //se pasa a la room
            navigate(`${webSiteChatURL}${userData.urlSessionid}`);
        });
        let chatMessage: Message = {
            senderId: userData.id,
            senderName: userData.username,
            date: getActualDate(),
            status: userData.status,
            urlSessionId: userData.urlSessionid
        }
        sendMessage(chatMessage,ChatPaths.CHECK_CHANNEL)
    }

    const subscribeRoomChannels = () => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + userData.urlSessionid, onMessageReceived);
        stompClient.current.subscribe(
            '/user/' + userData.id + "/" + userData.urlSessionid + '/private', onPrivateMessage);
    }

    const userJoin = () => {
        var chatMessage: Message = createPublicMessage(userData.status, userData);
        sendMessage(chatMessage,ChatPaths.CHAT_JOIN)
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
                // console.log("se banea a "+userToBan.username);
            }
        }
        if(message.status === MessagesStatus.UNBAN){
            let userToUnBan:UserChat = bannedUsers.find( (u:UserChat) => u.id === message.receiverId);
            if (userToUnBan!==null) {
                let bannedUsersAux = bannedUsers.filter( (u:UserChat) => u.id !== userToUnBan.id);
                setBannedUsers(bannedUsersAux);
                // console.log("se desbanea a "+userToUnBan.username);
            }
        }
    }

    const handleMakeAdmin = (message:Message) => {
        //yo era admin, ahora convierto a alguien en admin
        if(message.senderId === userData.id){
            let userToMakeAdmin:UserChat = getUserSavedFromChats(message.receiverId);
            userData.chatRole = ChatUserRole.CLIENT;
            userToMakeAdmin.chatRole = ChatUserRole.ADMIN
            alert("ℹ️: "+message.receiverName+' is the new admin!');
        }
        //Un admin me convierte a mi en admin 😎        
        if(message.receiverId === userData.id){
            let userToHandle:UserChat = getUserSavedFromChats(message.senderId);
            //Si es undefined significa que es el caso en el que el admin abandona la room
            if(userToHandle!==undefined){
                userToHandle.chatRole = ChatUserRole.CLIENT
            }
            userData.chatRole = ChatUserRole.ADMIN;
            alert("ℹ️: "+message.senderName+' has made you the new admin! 😎');
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
            alert("ℹ️: " +message.receiverName+' is the new admin!');
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
                case MessagesStatus.ERROR:
                    alert('Se ha producido un error. '+message.message);
                    // disconnectChat(true)
                    // navigate('/');
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
                sendMessage(chatMessage,ChatPaths.PRIVATE_MESSAGE)
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

    const authenticateClient = async (): Promise<string> => {
        try {
            const tokenResponse: string = await startAuthentication();
            //If auth is valid the values token and expirationToken in localstorage will be not null
            if (tokenResponse) {
                setTokenJwt(tokenResponse);
                let userDataStorage: UserDataSaveLocalStorage = JSON.parse(localStorage.getItem("userData"));
                userData.tokenExpirationDate= new Date(userDataStorage.tokenExpirationDate);
                return tokenResponse;
            } else {
                console.log("La conexión falló!");
                lostConnection.current = true;
                disconnectChat(false);
                navigate('/');
                return undefined;
            }
        } catch (error) {
            lostConnection.current = true;
            return undefined;
        }
    }

    const sendMessage = (message: Message, url: string) => {
        let tokenJwtAux: string = localStorage.getItem('tokenJwt');
        if(isTokenValid()){
            stompClient.current.send(
                url,
                {Authorization: `Bearer ${tokenJwtAux}`},
                JSON.stringify(message)
            )
        }else{
            authenticateClient()
                .then((tokenRes: string) => {
                    if(tokenRes) {
                        // console.log("token response correcto, se envía msj a "+url)
                        stompClient.current.send(
                            url,
                            {Authorization: `Bearer ${tokenRes}`},
                            JSON.stringify(message)
                        )
                    }
                });
        }
    }

    const isTokenPresent = (tokenJwtAux: string): boolean => {
        return (tokenJwtAux !== null && tokenJwtAux !== '' && tokenJwtAux  !== undefined && tokenJwtAux=== 'null');
    }

    const isTokenValid = (): boolean => {
        let tokenJwtAux: string = localStorage.getItem("tokenJwt");
        // console.log("tokenGuardado: "+tokenJwtAux)
        return !isAuthenticationExpired(userData.tokenExpirationDate)&&isTokenPresent(tokenJwtAux);
    }

    const startApplication = () => {
        loadUserDataValues();
        // let tokenExpirationDate: Date = JSON.parse(localStorage.getItem('userData')).tokenExpirationDate;
        if (isTokenValid()) {
            startServerConnection();
        } else {
            console.log("token inválido, autenticando...")
            authenticateClient()
                .then((tokenRes: string) => {
                    if(tokenRes) {
                        startServerConnection()
                    }
                });
        }
    }


//   const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
//   useEffect(() => {
//     const originalConsoleLog = console.log;
//     console.log = (...args: any[]) => {
//       // Mantenemos el comportamiento original de console.log
//       originalConsoleLog(...args);
//       // Actualizamos el estado para mostrar el mensaje en pantalla
//       setConsoleLogs(prevLogs => [...prevLogs, args.join(' ')]);
//     }
//         return () => {
//       // Restauramos console.log al valor original cuando el componente se desmonta
//       console.log = originalConsoleLog;
//     };
// },[]);

    // useEffect(()=>{
    //     if(localStorage.getItem("userData")===null || localStorage.getItem("userData")==="null"){
    //         return;
    //     }
    //     let userDataStorage: UserDataSaveLocalStorage = JSON.parse(localStorage.getItem("userData"));
    //     let tokenExpirationDate: Date = new Date(userDataStorage.tokenExpirationDate);
    //     let horaActual: Date = new Date();
    //     if(tokenExpirationDate < horaActual){
    //         authenticateClient();
    //     }
    // })

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
        startApplication();
    }, []);

    return (
        <chatRoomConnectionContext.Provider
            value={{
                disconnectChat,
                checkIfChannelExists,
                startServerConnection,
                sendMessage,
                startedConnection,
                lostConnection
            }}
        >
            <div className={`error-connection-msg ${lostConnection.current && 'active'}`}>
                Connection Lost!⚠️. Try uploading the page 
                    <button onClick={()=> window.location.reload()}>🔄</button>
                    .
            </div>


            {/* <div className='consola'>
                {consoleLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div> */}
            {!( (startedConnection.current && !isDataLoading && userData.connected)
                || lostConnection.current) &&
              <div className={'spinner-container'}><Spinner animation="border" role="status" /></div>}

            {children}
        </chatRoomConnectionContext.Provider>
    )
}