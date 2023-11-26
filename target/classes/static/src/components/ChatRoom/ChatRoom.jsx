import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate  } from 'react-router-dom';

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
import { userContext } from '../../context/UserDataContext.jsx';
import ChatGeneral from "./Chat/ChatGeneral/ChatGeneral.jsx";
import ChatPrivate from "./Chat/ChatPrivate/ChatPrivate.jsx";
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from './sidebar/Sidebar.jsx';
import { getRoomIdFromURL } from '../../utils/InputValidator.js';
import { getActualDate,convertUTCTimeToLocalTime } from '../../utils/MessageDateConvertor.js';
import { disconnectChat } from './ChatRoomFunctions.js';

const ChatRoom = () => {
    const navigate = useNavigate();
    
    const [channelExists, setChannelExists] = useState(false);

    const { isDataLoading, setIsDataLoading, userData, setUserData, startedConnection, privateChats, setPrivateChats,
        publicChats, setPublicChats, tab, setTab,stompClient } = useContext(userContext);
    /*
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] =useState("CHATROOM");

    */

    const [sidebarOpen, setSidebarOpen] = useState(true);


    const connect = () => {
        if (userData.connected || isDataLoading) {
            return;
        }
        if (userData.username === '' && localStorage.getItem('username') === null) {
            let nombre = prompt("Ingrese un nombre de usuario");
            localStorage.setItem('username', nombre);
            userData.username = nombre;
            setUserData({ ...userData, "username": nombre });
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
        console.log('se ejecuta oncconected');
        setUserData({ ...userData, "connected": true });

        let urlSessionIdAux = userData.URLSessionid;

        //caso en el que se conecta copiando la url en el navegador (aca no se puede acceder al userData pq no se carga el estado aún)
        //si no se tiene el id de la room se obtiene de la url
        if (userData.URLSessionid === '') {
            console.log("se esta conectando por url...");
            const url = window.location + "";
            urlSessionIdAux = getRoomIdFromURL(url);
            console.log("id obtenida: " + urlSessionIdAux);
            if (urlSessionIdAux === undefined) {
                disconnectChat();
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
        stompClient.current.subscribe('/user/' + userData.username + '/exists-channel', (payload) => {
            var payloadData = JSON.parse(payload.body);

            //este caso es raro que pase
            if ((payloadData.status === 'EXISTS' && userData.status === 'CREATE')) {
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat();
                return;
            }
            if ((payloadData.status === 'NOT_EXISTS' && userData.status === 'JOIN')) {
                alert('el canal al que se intenta conectar no existe');
                disconnectChat();
                return;
            }
            setChannelExists(true);
            subscribeRoomChannels(urlSessionIdAux)
        });

        var chatMessage = {
            senderName: userData.username,
            urlSessionId: urlSessionIdAux,
        };

        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))

    }

    const subscribeRoomChannels = (urlSessionIdAux) => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/' + urlSessionIdAux, onMessageReceived);
        stompClient.current.subscribe('/user/' + userData.username + "/" + urlSessionIdAux + '/private', onPrivateMessage);
        //escuchamos el canal que nos envía quién se desconectó
        //stompClient.subscribe('/chatroom/disconnected', onUserDisconnected);
        userJoin(urlSessionIdAux);
    }

    const userJoin = (urlSessionIdAux) => {
        //Al unirse a la sesion, se envia un msj a todos los usuarios conectados para que les 
        //lleguen los datos mios de q me conecté
        var chatMessage = {
            senderName: userData.username,
            urlSessionId: urlSessionIdAux,
            status: userData.status
        };
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
                disconnectChat()
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
        //si recibo yo mismo mi mensaje o info de que me uní me voy
        if (payloadData.senderName === userData.username) {
            return;
        }
        //Si no se tiene guardado quien se unio se guarda (tambien nos llega un msj de que este cliente mismo se unio)
        if (!privateChats.get(payloadData.senderName)) {
            privateChats.set(payloadData.senderName, []);
            setPrivateChats(new Map(privateChats));
            //cuando un usuario se une nuevo, éste no conoce quienes están unidos, 
            //por lo que le enviamos nuestro perfil para que lo guarde al que se unió (se maneja
            //en private msj)
            if (resend) {
                //la poronga del urlSessionId no se por qué concha puta no se guarda
                let roomId = userData.URLSessionid==='' ?payloadData.urlSessionId : userData.URLSessionid;
                var chatMessage = {
                    senderName: userData.username,
                    receiverName: payloadData.senderName,
                    urlSessionId: roomId,
                    status: "JOIN"
                };
                stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            }
        }
    }

    const handlePrivateMessageReceived = (payloadData) => {
        payloadData.date = convertUTCTimeToLocalTime(getActualDate(payloadData.date));
        if (privateChats.get(payloadData.senderName)) {
            let msg = privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    }


    const handleUserLeave = (payloadData) => {
        privateChats.delete(payloadData.senderName);
        setPrivateChats(new Map(privateChats));
    }

    /*
    Ahora cuando un usuario se desconecta el servidor maneja el evento y envia un msj global para
    que todos sepan quien fue y se maneja acá en handleMessegeReceived
    const onUserDisconnected = (payload) => {
        //borrar de la lista de chats al que se desconectó
        var payloadData = JSON.parse(payload.body);
        console.log("se recibe msj de que alguien se desconectó: "+payloadData.senderName);
        privateChats.delete(payloadData.senderName);
        setPrivateChats(new Map(privateChats));
    }



*/


    /*
        const unsubscribeChannels = () => {
            Object.keys(stompClient.subscriptions).forEach((s) => stompClient.unsubscribe(s));
        }
    */

        /*
    const resetValues = () => {
        setPrivateChats(new Map());
        setPublicChats([]);
        setTab("CHATROOM");
        setUserData({
            ...userData,
            "connected": false,
            "receivername": '',
            "message": '',
        });
    }
    */

    const onError = (err) => {
        console.log("Error conectando al wb: " + err);
        alert(err);
        //se vuelve a la pagina de registro:
        disconnectChat()

    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }

    //Envia msj a todos
    const sendValue = () => {
        if (stompClient.current) {
            var chatMessage = {
                senderName: userData.username,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid
            };
            //stompClient.current.send("/app/message", {}, JSON.stringify(chatMessage));
            //Ahora enviamos un 'msj grupal' solo a los que esten en nuestra sala
            stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));

            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient.current) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid
            };
            //si se envia un msj a alguien que no sea yo mismo
            if (userData.username !== tab) {
                //se guarda el msj enviado en el map de los msj privados. Si se enviara un msj a mi mismo entonces el map guardará el 
                //msj escrito cuando se reciba por parte del servidor. Si envío un msj a alguien distinto a mi mismo entonces el método
                //on onPrivateMessage se ejecutará en la compu del que recibe el msj no en la mia.
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            setUserData({ ...userData, "message": "" });
        }
    }

    /*
    const registerUser = (data) =>{
        stompClient=null;
        userData.username=data.username;        
        const {name}=data.username;
        setUserData({...userData,"username": name});
        connect(data)
    }
    */

    // useWindow("beforeunload", ()=>{
    //     alert('se hizo click en volver')
    // });



    useEffect(() => {
        //se ejecuta por cada renderizado
        connect();
        if (tab !== "CHATROOM" && privateChats.get(tab) === undefined) {
            setTab("CHATROOM")
        }
    })

    useEffect(() => {
        const handleOnBeforeUnload = ((e) => {
            e.preventDefault();
            alert('user is leaving the page');
            return '';
        });
        window.addEventListener('beforeunload',handleOnBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload',handleOnBeforeUnload);
        };
      }, []);

    return (
        <>
            {channelExists && startedConnection.current && !isDataLoading ?
                <div className='chatRoom-global'>
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        disconnectChat={disconnectChat}
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
                        {/*</div>*/}

                    </div>
                </div> : <div>Cargando...</div>}
        </>
    )
}

export default ChatRoom