import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import './ChatRoom.css';
import { userContext } from '../../context/UserDataContext.jsx';
import { chatRoomConnectionContext } from '../../context/ChatRoomConnectionContext.jsx';
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from './sidebar/Sidebar.jsx';
import { getRoomIdFromURL } from '../../utils/InputValidator.js';
import { createPrivateMessage, createPublicMessage } from './ChatRoomFunctions.js';
import ChatContainer from './chat-container/ChatContainer.jsx';


const ChatRoom = () => {
    const navigate = useNavigate();

    const { isDataLoading, userData, setUserData,
        tab, setTab, stompClient, channelExists, chats, setChats } = useContext(userContext);

    const { startedConnection } = useContext(chatRoomConnectionContext);

    const { disconnectChat, checkIfChannelExists, chatUserTyping } = useContext(chatRoomConnectionContext)

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [writingCooldown, setWritingCooldown] = useState(false);

    const connect = () => {
        if (stompClient.current === null) {
            return;
        }
        if (!startedConnection.current || isDataLoading || !userData.connected) {
            return;
        }

        if (userData.username === '' || localStorage.getItem('username') === null
            || localStorage.getItem('username') === 'null') {
            let nombre = prompt("Ingrese un nombre de usuario");
            if (nombre === null) {
                disconnectChat();
                navigate("/");
                return;
            }
            localStorage.setItem('username', nombre);
            setUserData({ ...userData, "username": nombre });
            return;
        }
        if (userData.URLSessionid === '') {
            const url = window.location + "";
            let urlSessionIdAux = getRoomIdFromURL(url);
            if (urlSessionIdAux === undefined) {
                disconnectChat();
                navigate("/");
                return;
            }
            setUserData({ ...userData, "URLSessionid": urlSessionIdAux });
            if (stompClient.current !== null) {
                checkIfChannelExists(urlSessionIdAux);
            }
            return;
        }
    }

    const sendValue = (status='MESSAGE') => {
        if (userData.message.trim() === '') {
            return;
        }
        if (stompClient.current) {
            var chatMessage = createPublicMessage(status, userData);
            stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
            if (status === "MESSAGE") {
                setUserData({ ...userData, "message": "" });
            }
        }
    }

    const sendPrivateValue = (status='MESSAGE') => {
        if (userData.message.trim() === '') {
            return;
        }
        if (stompClient.current) {
            var chatMessage = createPrivateMessage(status, userData, tab.username, tab.id);
            //si se envia un msj a alguien que no sea yo mismo
            if (userData.userId !== tab.id) {
                chats.get(tab).push(chatMessage);
                setChats(new Map(chats));
            }
            stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendWritingNotification = () => {
        if(tab.username==='CHATROOM'){
            sendValue('WRITING');
        }else{
            sendPrivateValue('WRITING');
        }
        
    }

    const handleDisconnectChat = () => {
        disconnectChat();
        //avisamos a todos que nos desconectamos
        var chatMessage = createPublicMessage('LEAVE', userData)
        stompClient.current.send("/app/user.disconnected", {}, JSON.stringify(chatMessage));

        navigate('/');
    }

    const setMessageTyping = () => {
        if (chatUserTyping.chatUser === null || chatUserTyping.chatUser === undefined) {
            return;
        }
        if (chatUserTyping.isPublicMessage && tab.username === 'CHATROOM') {
            return `${chatUserTyping.chatUser.username} is typing...`;
        }

        if (!chatUserTyping.isPublicMessage && tab.username !== 'CHATROOM') {
            return 'Typing...';
        }
    }

    const handleKeyPressedMsg = (e) => {
        e.preventDefault()
        let key = e;
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
        if (tab !== Array.from(chats.keys())[0] && chats.get(tab) === undefined) {
            //se setea tab chatroom por defecto
            setTab(Array.from(chats.keys())[0]);
            //Array.from(chats.keys())[0].hasUnreadedMessages = false;
        }
        if (tab === undefined) {
            setTab(Array.from(chats.keys())[0]);
            //Array.from(chats.keys())[0].hasUnreadedMessages = false;
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
                            <span className="text">{`${tab === 'CHATROOM' ? 'CHAT GENERAL' : tab.username}`}</span>
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