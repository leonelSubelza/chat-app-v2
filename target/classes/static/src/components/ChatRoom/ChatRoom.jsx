import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom';

/*
Stomp es una biblioteca JavaScript que se utiliza para enviar y recibir 
mensajes a través del protocolo STOMP (Simple Text Oriented Messaging Protocol).
*/
import { over } from 'stompjs';
import './ChatRoom.css';


//Es una librearia de JS. A diferencia de usar la api WebSocket para crear la conexion,
//Esta sirve para que pueda ser usada en navegadores más viejos.
import SockJS from 'sockjs-client';
import { serverURL } from '../../config/chatConfiguration.js';
import { useUserDataContext, userContext } from '../../context/UserDataContext.jsx';
import ChatGeneral from "./Chat/ChatGeneral/ChatGeneral.jsx";
import ChatPrivate from "./Chat/ChatPrivate/ChatPrivate.jsx";
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from './sidebar/Sidebar.jsx';
import { getRoomIdFromURL } from '../../utils/InputValidator.js';
import { getActualDate, convertUTCTimeToLocalTime } from '../../utils/MessageDateConvertor.js';
import { disconnectChat, createUserChat, createPrivateMessage, createPublicMessage } from './ChatRoomFunctions.js';
import { generateUserId } from '../../utils/IdGenerator.js';

const ChatRoom = () => {
    const navigate = useNavigate();

    const { isDataLoading, userData, setUserData, startedConnection, privateChats, setPrivateChats,
        publicChats, setPublicChats, tab, setTab, stompClient, channelExists, setChannelExists } = useContext(userContext);

    const userContextObj = useUserDataContext();
    /*
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] =useState("CHATROOM");

    */

    const [sidebarOpen, setSidebarOpen] = useState(true);


    const connect = () => {
        /*
        if (localStorage.getItem('connected') === true &&
            !startedConnection.current
            //&& userData.username!=='' 
            && !userData.connected
            && (stompClient.current === null)) {
            alert('Already connected!')
            return;
        }
        */

        if (userData.connected || isDataLoading) {
            return;
        }


        if (userData.username === '' || localStorage.getItem('username') === null
            || localStorage.getItem('username') === 'null') {
            let nombre = prompt("Ingrese un nombre de usuario");
            localStorage.setItem('username', nombre);
            setUserData({ ...userData, "username": nombre });
            return;
        }
        //CREAR CANAL PARA SABER QUIEN ESTA ESCRIBIENDO

        if (!startedConnection.current
            //&& userData.username!=='' 
            && !userData.connected
            && (stompClient.current === null)) {

            let Sock = new SockJS(serverURL);
            stompClient.current = over(Sock);
            startedConnection.current = true;
            stompClient.current.connect({}, onConnected, onError);
        }
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
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

            //este caso es raro que pase
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
        //escuchamos el canal que nos envía quién se desconectó
        //stompClient.subscribe('/chatroom/disconnected', onUserDisconnected);
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
        /*
        var chatMessage = {
            senderId:userIdAux,
            senderName: userData.username,
            urlSessionId: urlSessionIdAux,
            status: userData.status,
            avatarImg: userData.avatarImg
        };
        */
        //Se envia un msj al servidor, el cual se envia a todos los usuarios conectados
        //stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
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
                payloadData.date = convertUTCTimeToLocalTime(getActualDate(payloadData.date));
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
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
                //recibo un mensaje de alguien
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
            //cuando un usuario se une nuevo, éste no conoce quienes están unidos, 
            //por lo que le enviamos nuestro perfil para que lo guarde al que se unió (se maneja
            //en private msj lo recibido)
            if (resend) {
                //la poronga del urlSessionId no se por qué concha puta no se guarda
                let roomId = userData.URLSessionid === '' ? payloadData.urlSessionId : userData.URLSessionid;
                let userDataAux = userData;
                userDataAux.URLSessionid = roomId;
                var chatMessage = createPrivateMessage('JOIN', userDataAux, payloadData.senderName, payloadData.senderId);
                /*
                var chatMessage = {
                    senderId:userIdAux,
                    senderName: userData.username,
                    receiverName: payloadData.senderName,
                    urlSessionId: roomId,
                    status: "JOIN",
                    avatarImg: userData.avatarImg
                };
                */
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
        payloadData.date = convertUTCTimeToLocalTime(getActualDate(payloadData.date));

        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId)
        console.log("ses recibe un msj de: " + payloadData.senderName);
        //privateChats.get(payloadData.senderName)
        if (userSaved) {
            console.log("se agrega a msj ya guardados");
            privateChats.get(userSaved).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            var chatUser = createUserChat(payloadData);
            console.log("se crea un nuevo campo");
            let list = [];
            list.push(payloadData);
            privateChats.set(chatUser, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const handleUserLeave = (payloadData) => {
        let userSaved = getUserSavedFromPrivateMenssage(payloadData.senderId)
        privateChats.delete(userSaved);
        console.log("se borra usuario: " + userSaved.username);
        setPrivateChats(new Map(privateChats));
    }

    const onError = (err) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        //se vuelve a la pagina de registro:
        disconnectChat(userContextObj)
        navigate('/')
    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }

    //Envia msj a todos
    const sendValue = () => {
        if (stompClient.current) {
            var chatMessage = createPublicMessage('MESSAGE', userData);
            /*
            var chatMessage = {
                senderId:userData.userId,
                senderName: userData.username,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid,
                avatarImg: userData.avatarImg
            };
            */
            //Ahora enviamos un 'msj grupal' solo a los que esten en nuestra sala
            stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
            //el msj enviado se guarda en la func que procesa un msj recibido grupal debería hacerse acá >:(
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient.current) {
            var chatMessage = createPrivateMessage('MESSAGE', userData, tab.username, tab.id);
            /*
            var chatMessage = {
                senderId:userData.userId,
                senderName: userData.username,
                receiverName: tab,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid,
                avatarImg: userData.avatarImg
            };
            */
            //si se envia un msj a alguien que no sea yo mismo
            if (userData.userId !== tab.id) {
                //cuando un usuario se une se guarda su referencia en el map, por lo que nunca será vacio
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            setUserData({ ...userData, "message": "" });
        }
    }

    const handleDisconnectChat = () => {
        disconnectChat(userContextObj);
        navigate('/');
    }

    useEffect(() => {
        connect();

        //se ejecuta por cada renderizado        
        if (tab !== "CHATROOM" && privateChats.get(tab) === undefined) {
            setTab("CHATROOM")
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
                            <span className="text">CHAT GENERAL</span>
                        </div>

                        {tab !== "CHATROOM" ? <ChatPrivate
                            privateChats={privateChats}
                            tab={tab}
                            sendPrivateValue={sendPrivateValue}
                            userData={userData}
                            handleMessage={handleMessage}
                        /> : <ChatGeneral
                            publicChats={publicChats}
                            handleMessage={handleMessage}
                            sendValue={sendValue}
                        />}

                        <MessageInput
                            value={userData.message}
                            onChange={handleMessage}
                            onSend={tab === 'CHATROOM' ? sendValue : sendPrivateValue}
                            tab={tab}
                        />
                    </div>
                </div> : <div>Cargando...</div>}
        </>
    )
}

export default ChatRoom


//arreglar estados donde se guardan los private messages, el metodo get no devuelve nada y en el
//backend verificar que no se pueda volver a conectar el mismo usuario
/*
PARA QUE PUEDA HABER USUARIOS CON EL MISMO NOMBRE:ahora los usuarios manejan un id 
Ahora los usuarios tienen un id, habrá que cambiar que en los canales a los que se suscribe tengan su
id en vez del nombre y si ya existe ese id generado entonces que se actualice y se genere otro
AUN NO LO HICE

*/