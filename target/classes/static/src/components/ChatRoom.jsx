import React, { useState,useEffect,useContext,useRef } from 'react'
import { useNavigate,useLocation  } from 'react-router-dom';
/*
Stomp es una biblioteca JavaScript que se utiliza para enviar y recibir 
mensajes a través del protocolo STOMP (Simple Text Oriented Messaging Protocol).
*/
import {over} from 'stompjs';

//Es una librearia de JS. A diferencia de usar la api WebSocket para crear la conexion,
//Esta sirve para que pueda ser usada en navegadores más viejos.
import SockJS from 'sockjs-client';
import {serverURL} from '../config/chatConfiguration.js';
import {userContext} from '../context/UserDataContext.jsx';

const ChatRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stompClient = useRef(null);
    const startedConnection = useRef(false);
    const [channelExists,setChannelExists] = useState(false);

    const { userData,setUserData } = useContext(userContext);
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    
    const [tab,setTab] =useState("CHATROOM");

    const connect =()=>{
        if(userData.connected){
            return;
        }

        //FALTA PODER CONECTARSE A LA SALA POR URL SIN TENER NOMBRE PUESTO
        //GUARDAR EN LOCALSTORAGE LOS DATOS PERSISTIBLES DEL USUARIO
        //CREAR CANAL PARA SABER QUIEN ESTA ESCRIBIENDO
        //MOSTRAR MENSAJITO PARA VER QUIEN SE FUE UWU

        if( !startedConnection.current 
            && (userData.username!=='' && !userData.connected )
            && (stompClient===null || !stompClient.connected)){
            startedConnection.current = true;
            let Sock = new SockJS(serverURL);
            stompClient.current = over(Sock);
            stompClient.current.connect({},onConnected, onError);
        }
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        console.log("url actual: ");
        console.log(location);
        if(userData.URLSessionid===''){
            let location = useLocation();
        }
        if(userData.urlSessionId===''){
            userData.urlSessionId = getIdFromURL();
        }
        if(userData.urlSessionId===''){
            alert('no se puso ningun id ni en el userdata ni en la url');
            disconnectChat();
            navigate('/');
        }

        //primero checkeamos que el canal al que se quiere unir existe
        //o si se quiere crear una sala que ya existe
        checkIfChannelExists();  
    }

    const checkIfChannelExists = ()=>{
        stompClient.current.subscribe('/user/'+userData.username+'/exists-channel', (payload)=>{
            var payloadData = JSON.parse(payload.body);

            //este caso es raro que pase
            if((payloadData.status==='EXISTS' && userData.status==='CREATE')){
                alert('Se intenta crear una sala con un id que ya existe');
                disconnectChat();
                navigate('/');
                return;
            }
            if( (payloadData.status==='NOT_EXISTS' && userData.status==='JOIN')){
                alert('el canal al que se intenta conectar no existe');
                disconnectChat();
                navigate('/');
                return;
            }
            setChannelExists(true);
            subscribeRoomChannels()
        });

        var chatMessage = {
            senderName: userData.username,
            urlSessionId:userData.URLSessionid,
        };
        stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))

    }

    const subscribeRoomChannels = () => {
        stompClient.current.subscribe('/chatroom/public', onMessageReceived);
        stompClient.current.subscribe('/chatroom/'+userData.URLSessionid, onMessageReceived);
        stompClient.current.subscribe('/user/'+userData.username+"/"+userData.URLSessionid+'/private', onPrivateMessage);
        //escuchamos el canal que nos envía quién se desconectó
        //stompClient.subscribe('/chatroom/disconnected', onUserDisconnected);
        userJoin();
    }

    const userJoin=()=>{
        //Al unirse a la sesion, se envia un msj a todos los usuarios conectados para que les 
        //lleguen los datos mios de q me conecté
          var chatMessage = {
            senderName: userData.username,
            urlSessionId:userData.URLSessionid,
            status:userData.status
          };
          //Se envia un msj al servidor, el cual se envia a todos los usuarios conectados
          //stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
    }

    //llega un msj publico
    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "JOIN":
                handleJoinUser(payloadData,true);
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            case "LEAVE":
                handleUserLeave(payloadData);
                break;
            case "ERROR":
                alert('Error conectando al chat. Nose que pudo haber sido, se enviaron mal los datos xD');
                disconnectChat()
                navigate('/');
                break;
            default:
                break;
        }
    }
    
    const onPrivateMessage = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "JOIN":
                //Los usuarios que no conzco me dicen quienes son uwu
                handleJoinUser(payloadData,false);
                break;
            case "MESSAGE":
                //recibo un mensaje de alguien
                handlePrivateMessageReceived(payloadData);
                break;
            default:
                break;
        }
    }


    const handleJoinUser = (payloadData,resend)=>{
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
            if(resend){
                var chatMessage = {
                    senderName: userData.username,
                    receiverName: payloadData.senderName,
                    urlSessionId:userData.URLSessionid,
                    status: "JOIN"
                };
                stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
            }
        }
    }

    const handlePrivateMessageReceived = (payloadData) =>{
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
        console.log("se recibe msj, horario parseado correctamente: ");
        convertUTCTimeToLocalTime(getActualDate(payloadData.date));
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
    const disconnectChat = () => {
        userData.connected=false; 
        if(stompClient.current!==null) {
            stompClient.current.disconnect();
        }
        //setStompClient(null);
        resetValues();
    }

/*
    const unsubscribeChannels = () => {
        Object.keys(stompClient.subscriptions).forEach((s) => stompClient.unsubscribe(s));
    }
*/

    const resetValues = () =>{
        setPrivateChats(new Map());
        setPublicChats([]);
        setTab("CHATROOM");
        setUserData({
            username: '',
            connected: false,
            receivername: '',
            message: '',
            URLSessionid:'pene',
            status:'JOIN'
          });
    }

    const onError = (err) => {
        console.log("Error conectando al wb: "+err);
        alert(err);
        //se vuelve a la pagina de registro:
        disconnectChat()
        navigate('/');
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }

    //Envia msj a todos
    const sendValue=()=>{
            if (stompClient.current) {
              var chatMessage = {
                senderName: userData.username,
                date:getActualDate(),
                message: userData.message,
                status:"MESSAGE",
                urlSessionId:userData.URLSessionid
              };
              //stompClient.current.send("/app/message", {}, JSON.stringify(chatMessage));
              //Ahora enviamos un 'msj grupal' solo a los que esten en nuestra sala
              stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
              
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient.current) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            date:getActualDate(),
            message: userData.message,
            status:"MESSAGE",
            urlSessionId:userData.URLSessionid
          };
        //si se envia un msj a alguien que no sea yo mismo
          if(userData.username !== tab){
            //se guarda el msj enviado en el map de los msj privados. Si se enviara un msj a mi mismo entonces el map guardará el 
            //msj escrito cuando se reciba por parte del servidor. Si envío un msj a alguien distinto a mi mismo entonces el método
            //on onPrivateMessage se ejecutará en la compu del que recibe el msj no en la mia.
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          console.log("se envía msj, horario parseado correctamente: ");
          convertUTCTimeToLocalTime(getActualDate());
          stompClient.current.send("/app/private-message", {}, JSON.stringify(chatMessage))
          setUserData({...userData,"message": ""});
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

    const getActualDate = () => {
        var fechaHoraActual = new Date();
        //este formate es universal, por lo que si la otra persona esta en otra region se debe convertir a su
        //zona respectiva
        var formatoUTC = fechaHoraActual.toISOString();
        return formatoUTC;
    }

    const convertUTCTimeToLocalTime = (UTCFormat)=>{
        var fechaUTC = new Date(UTCFormat);
        var opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        var fechaHoraLocal = fechaUTC.toLocaleString(undefined, opciones);
        console.log("Fecha y hora en zona horaria local2: " + fechaHoraLocal);
    }

    

    useEffect(() => {
        //se ejecuta solo cuando se monta el componente una vez
        connect();
    },[])

    useEffect(() => {
        //se ejecuta por cada renderizado
        if(!userData.connected && userData.username === ''){
            disconnectChat()
            navigate('/');
            return;
        }

        if(tab!=="CHATROOM" && privateChats.get(tab)===undefined){
            setTab("CHATROOM")
        }
    })

    return (
    <div className="container">
        { channelExists&&startedConnection.current ?
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>setTab("CHATROOM")} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {privateChats.size>0 && [...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                    ))}
                </ul>
                <div className='user-info-container'>
                    <div className="user-info">
                        <img src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon"/>
                        <p>{userData.username}</p>
                    </div>
                    <button type="button" className="leave-button" onClick={disconnectChat}>Leave</button>
                </div>
                
            </div>
            {tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {publicChats.map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendValue}>send</button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {(privateChats.size>0 && privateChats.get(tab)!==undefined) && [...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                </div>
            </div>}
        </div>          
        :
        <div>Cargando...</div>}
    </div>
    )
}

export default ChatRoom