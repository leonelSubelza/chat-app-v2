import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import './ChatRoom.css';
import { useUserDataContext, userContext } from '../../context/UserDataContext.jsx';
import { chatRoomConnectionContext, useChatRoomConnectionContext } from '../../context/ChatRoomConnectionContext.jsx';
import ChatGeneral from "./Chat/ChatGeneral/ChatGeneral.jsx";
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from './sidebar/Sidebar.jsx';
import { getRoomIdFromURL } from '../../utils/InputValidator.js';
import { createPrivateMessage, createPublicMessage } from './ChatRoomFunctions.js';


const ChatRoom = () => {
    const navigate = useNavigate();

    const { isDataLoading, userData, setUserData, privateChats, setPrivateChats,
        publicChats, setPublicChats, tab, setTab, stompClient, channelExists, setChannelExists,chats,setChats } = useContext(userContext);

    const {startedConnection} = useContext(chatRoomConnectionContext);
    const userContextObj = useUserDataContext();

    const {disconnectChat,checkIfChannelExists} = useContext(chatRoomConnectionContext)

    const [sidebarOpen, setSidebarOpen] = useState(true);


    const connect = () => {
        if(stompClient.current===null){
            return;
        }
        if (!startedConnection.current || isDataLoading || !userData.connected) {
            return;
        }

        if (userData.username === '' || localStorage.getItem('username') === null
            || localStorage.getItem('username') === 'null') {
            let nombre = prompt("Ingrese un nombre de usuario");
            if(nombre===null){
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
            if(stompClient.current!==null){
                checkIfChannelExists(urlSessionIdAux);
            }
            return;
        }
        //CREAR CANAL PARA SABER QUIEN ESTA ESCRIBIENDO

        // if (!startedConnection.current
        //     //&& userData.username!=='' 
        //     && !userData.connected
        //     && (stompClient.current === null)) {

        //     let Sock = new SockJS(serverURL);
        //     stompClient.current = over(Sock);
        //     startedConnection.current = true;
        //     stompClient.current.connect({}, onConnected, onError);
        // }
    }

    //Envia msj a todos
    const sendValue = (status) => {
        if(userData.message.trim() === ''){
            return;
        }
        if (stompClient.current) {
            var chatMessage = createPublicMessage(status, userData);
            //Ahora enviamos un 'msj grupal' solo a los que esten en nuestra sala
            stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
            if(status==="MESSAGE"){
                setUserData({ ...userData, "message": "" });
            }
        }
    }

    const sendPrivateValue = () => {
        if(userData.message.trim() === ''){
            return;
        }
        if (stompClient.current) {
            var chatMessage = createPrivateMessage('MESSAGE', userData, tab.username, tab.id);
            //si se envia un msj a alguien que no sea yo mismo
            if (userData.userId !== tab.id) {
                //cuando un usuario se une se guarda su referencia en el map, por lo que nunca será vacio
                //privateChats.get(tab).push(chatMessage);
                //setPrivateChats(new Map(privateChats));

                chats.get(tab).push(chatMessage);
                setChats(new Map(chats));
            }
            stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            setUserData({ ...userData, "message": "" });
        }
    }

    const handleDisconnectChat = () => {
        disconnectChat();
        //avisamos a todos que nos desconectamos
        var chatMessage = {
            senderId:userData.userId,
            senderName: userData.username,
            urlSessionId: userData.URLSessionid,
            status: 'LEAVE',
            avatarImg: userData.avatarImg
        }
        stompClient.current.send("/app/user.disconnected", {}, JSON.stringify(chatMessage));

        navigate('/');
    }

    const handleKeyPressedMsg = (e) => {
        let key = e;
        if (typeof e !== 'string') {
            key = e.key;
        }
        if(key === 'Enter'){
            //if(tab === 'CHATROOM'){
            if(tab.username === 'CHATROOM'){
                sendValue("MESSAGE");
            }else{
                sendPrivateValue();
            }
        }
        // else{
        //     setTimeout(() => {
        //         sendValue("WRITING")
        //     }, 5000);
        // }
    }

    useEffect(() => {
        connect();
        //if (tab !== "CHATROOM" && chats.get(tab) === undefined) {
        if (tab !== Array.from(chats.keys())[0] && chats.get(tab) === undefined) {
            //setTab("CHATROOM")
            setTab(Array.from(chats.keys())[0]);
        }
        if(tab === undefined){
            console.log("tab era undefined, se setea tab chatroom");
            setTab(Array.from(chats.keys())[0]);
        }
        if(userData.connected){
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
                        {/*<div className={`chat-text-button ${sidebarOpen ? 'close' : ''}`}>*/}
                        <div className="home-content">
                            <span className="text">{`${tab === 'CHATROOM' ? 'CHAT GENERAL' : tab.username}`}</span>
                        </div>

                        {/*tab !== "CHATROOM" ? <ChatPrivate/> : <ChatGeneral/>*/}
                        <ChatGeneral/>
                        <MessageInput
                            onSend={tab.username === 'CHATROOM' ? ()=>sendValue("MESSAGE") : sendPrivateValue}
                        />
                    </div>
                </div> : <div>Cargando...</div>}
        </>
    )
}

export default ChatRoom;

    /*
    const onConnected = () => {
        userData.connected = true
        setUserData({ ...userData});
        //localStorage.setItem('connected', true)
        let urlSessionIdAux = userData.URLSessionid;

        //caso en el que se conecta copiando la url en el navegador (aca no se puede acceder al userData pq no se carga el estado aún)
        //si no se tiene el id de la room se obtiene de la url
        if (userData.URLSessionid === '') {
            const url = window.location + "";
            urlSessionIdAux = getRoomIdFromURL(url);
            if (urlSessionIdAux === undefined) {
                disconnectChat(userContextObj);
                navigate("/");
                return;
            }
            setUserData({ ...userData, "URLSessionid": urlSessionIdAux });
        }

        //primero checkeamos que el canal al que se quiere unir existe
        //o si se quiere crear una sala que ya existe
        checkIfChannelExists(urlSessionIdAux);
    }

    const checkIfChannelExists = (urlSessionIdAux) => {
        stompClient.current.subscribe('/user/' + userData.userId + '/exists-channel', (payload) => {
            var payloadData = JSON.parse(payload.body);
            if ((payloadData.status === 'EXISTS' && userData.status === 'CREATE')) {
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat(userContextObj);
                navigate('/');
                return;
            }
            if ((payloadData.status === 'NOT_EXISTS' && userData.status === 'JOIN')) {
                alert('el canal al que se intenta conectar no existe');
                disconnectChat(userContextObj);
                navigate('/');
                return;
            }
            setChannelExists(true);
            //setUserData({ ...userData, "userId": payloadData.senderId });
            subscribeRoomChannels(urlSessionIdAux)
        });

        var chatMessage = {
            senderId: userData.userId,
            senderName: userData.username,
            urlSessionId: urlSessionIdAux,
        };
        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))
    }

    const subscribeRoomChannels = (urlSessionIdAux) => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + urlSessionIdAux, onMessageReceived);
        stompClient.current.subscribe('/user/' + userData.userId + "/" + urlSessionIdAux + '/private', onPrivateMessage);
        userJoin(urlSessionIdAux);
    }

    const userJoin = (urlSessionIdAux) => {
        //Al unirse a la sesion, se envia un msj a todos los usuarios conectados para que les 
        //lleguen los datos mios de q me conecté
        let userDataAux = userData;
        userDataAux.URLSessionid = urlSessionIdAux;
        //despues fijarse si se carga bien el url session id asi no hago esta variable 

        //aca el status puede ser CREATE o JOIN depende
        var chatMessage = createPublicMessage(userData.status, userDataAux);
        stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
    }

    //llega un msj publico
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
                if(userToUpdate){
                    updateChatData(payloadData,userContextObj,userToUpdate);
                }
                break;
            case "LEAVE":
                handleUserLeave(payloadData);
                break;
            case "ERROR":
                alert('Error conectando al chat. Nose que pudo haber sido, se enviaron mal los datos xD');
                //Por las dudas si se genero mal el id que se haga uno nuevo :,(
                setUserData({ ...userData, 'userId': generateUserId() });
                disconnectChat(userContextObj)
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
        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId)
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
        if(payloadData.senderId===userData.userId){
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

    const onError = (err) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        //se vuelve a la pagina de registro:
        disconnectChat(userContextObj)
        navigate('/')
    }

    */