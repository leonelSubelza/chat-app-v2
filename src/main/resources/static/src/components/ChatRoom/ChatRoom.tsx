import React, { useState, useEffect, useContext } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom';
import './ChatRoom.css';
import { userContext } from '../../context/UserDataContext';
import { chatRoomConnectionContext } from '../../context/ChatRoomConnectionContext';
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from './sidebar/Sidebar.jsx';
import { getRoomIdFromURL } from '../../utils/InputValidator.js';
import { createPrivateMessage, createPublicMessage } from './ChatRoomFunctions';
import ChatContainer from './chat-container/ChatContainer.jsx';
import { MessagesStatus } from '../interfaces/messages.status';
import { Message } from '../interfaces/messages';


const ChatRoom: React.FC = () => {
    const navigate: NavigateFunction = useNavigate();

    const { isDataLoading, userData, setUserData,
        tab, setTab, stompClient, channelExists, chats, setChats } = useContext(userContext);

    const { startedConnection } = useContext(chatRoomConnectionContext);

    const { disconnectChat, checkIfChannelExists, chatUserTyping } = useContext(chatRoomConnectionContext)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const [writingCooldown, setWritingCooldown] = useState<boolean>(false);

    const connect = (): void => {
        if (stompClient.current === null) {
            return;
        }
        if (!startedConnection.current || isDataLoading || !userData.connected) {
            return;
        }

        if (userData.username === '' || localStorage.getItem('username') === null
            || localStorage.getItem('username') === 'null') {
            let nombre: string = prompt("Ingrese un nombre de usuario");
            if (nombre === null) {
                alert('El nombre no puede ser vacío')
                disconnectChat();
                navigate("/");
                return;
            }
            localStorage.setItem('username', nombre);
            setUserData({ ...userData, "username": nombre });
            return;
        }
        //Caso en el que se conecta copiando la url, no se tiene cargado e idRoom, entonces se carga
        if (userData.URLSessionid === '') {
            const url: string = window.location + "";
            let urlSessionIdAux: string = getRoomIdFromURL(url);
            if (urlSessionIdAux === undefined) {
                disconnectChat();
                navigate("/");
                return;
            }
            userData.URLSessionid = urlSessionIdAux;
            setUserData({ ...userData, "URLSessionid": urlSessionIdAux });
            if (stompClient.current !== null) {
                checkIfChannelExists();
            }
            return;
        }
    }

    const sendValue = (status: MessagesStatus = MessagesStatus.MESSAGE): void => {
        if (userData.message.trim() === '') {
            return;
        }
        if (stompClient.current) {
            var chatMessage: Message = createPublicMessage(status, userData);
            stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
            if (status === MessagesStatus.MESSAGE) {
                setUserData({ ...userData, "message": "" });
            }
        }
    }

    const sendPrivateValue = (status: MessagesStatus = MessagesStatus.MESSAGE) => {
        if (userData.message.trim() === '') {
            return;
        }
        if (stompClient.current) {
            var chatMessage: Message = createPrivateMessage(status, userData, tab.username, tab.id);
            //si se envia un msj a alguien que no sea yo mismo
            if (userData.userId !== tab.id) {
                chats.get(tab).push(chatMessage);
                setChats(new Map(chats));
            }
            stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            if (status === MessagesStatus.MESSAGE) {
                setUserData({ ...userData, "message": "" });
            }
        }
    }

    const sendWritingNotification = (): void => {
        if(tab.username==='CHATROOM'){
            sendValue(MessagesStatus.WRITING);
        }else{
            sendPrivateValue(MessagesStatus.WRITING);
        }
        
    }

    const handleDisconnectChat = ():void => {
        disconnectChat();
        //avisamos a todos que nos desconectamos
        var chatMessage: Message = createPublicMessage(MessagesStatus.LEAVE, userData)
        stompClient.current.send("/app/user.disconnected", {}, JSON.stringify(chatMessage));
        navigate('/');
    }

    const setMessageTyping = (): string => {
        if (chatUserTyping.chatUser === null || chatUserTyping.chatUser === undefined) {
            return '';
        }
        if (chatUserTyping.isPublicMessage && tab.username === 'CHATROOM') {
            return `${chatUserTyping.chatUser.username} is typing...`;
        }

        if (!chatUserTyping.isPublicMessage && tab.username !== 'CHATROOM') {
            return 'Typing...';
        }
    }

    const handleKeyPressedMsg = (e: KeyboardEvent): void => {
        e.preventDefault()
        let key: KeyboardEvent|string = e;
        if (typeof e !== 'string') {
            key = e.key;
        }
        if (key === 'Enter') {
            if (tab.username === 'CHATROOM') {
                sendValue();
            } else {
                sendPrivateValue();
            }
            return;
        }
        if (!writingCooldown) {
            sendWritingNotification();
            setWritingCooldown(true);
        } else {
            setTimeout(() => {
                setWritingCooldown(false)
            }, 5000);
        }
    }

    useEffect(() => {
        connect();
        let chatRoomElement = Array.from(chats.keys())[0];
        if(chatRoomElement === undefined){
            return;
        }
        if (tab !== chatRoomElement && chats.get(tab) === undefined) {
            //se setea tab chatroom por defecto
            setTab(chatRoomElement);
            Array.from(chats.keys())[0].hasUnreadedMessages = false;
            setChats(new Map(chats));
        }
        if (tab === undefined) {
            setTab(chatRoomElement);
            Array.from(chats.keys())[0].hasUnreadedMessages = false;
            setChats(new Map(chats));
        }
        if (userData.connected) {
            window.addEventListener('keyup', handleKeyPressedMsg);
        }
        return () => {
            window.removeEventListener('keyup', handleKeyPressedMsg);
        }
    })
    return (
        <>
            {channelExists && startedConnection.current && !isDataLoading ?
                <div className='chatRoom-global'>
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        disconnectChat={handleDisconnectChat}
                        handleSideBarOpen={() => setSidebarOpen(!sidebarOpen)}
                    />
                    <div className={`chat-box ${sidebarOpen ? 'close' : ''}`}>
                        <div className="home-content">
                            <span className="text">{`${tab.username === 'CHATROOM' ? 'CHAT GENERAL' : tab.username}`}</span>
                            <span
                                className={`user_writing ${chatUserTyping.chatUser !== null && chatUserTyping.isChatUserTyping && 'active'}`}>
                                {setMessageTyping()}
                            </span>
                        </div>
                        <ChatContainer />
                        <MessageInput
                            onSend={tab.username === 'CHATROOM' ? sendValue : sendPrivateValue}
                        />
                    </div>
                </div> : <div>Cargando...</div>}
        </>
    )
}

export default ChatRoom;