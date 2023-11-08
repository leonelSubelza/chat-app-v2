import React, { useState,useEffect } from 'react'
/*
Stomp es una biblioteca JavaScript que se utiliza para enviar y recibir 
mensajes a través del protocolo STOMP (Simple Text Oriented Messaging Protocol).
*/
import {over} from 'stompjs';

//Es una librearia de JS. A diferencia de usar la api WebSocket para crear la conexion,
//Esta sirve para que pueda ser usada en navegadores más viejos.
import SockJS from 'sockjs-client';
import Register from './Register';
import {serverURL} from '../config/chatConfiguration.js';

var stompClient =null;
const ChatRoom = () => {
    
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
      });

    const connect =()=>{
        let Sock = new SockJS(serverURL);
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        //escuchamos el canal que nos envía quién se desconectó
        //stompClient.subscribe('/chatroom/disconnected', onUserDisconnected);
        userJoin();
    }

    const userJoin=()=>{
        //Al unirse a la sesion, se envia un msj a todos los usuarios conectados para que les 
        //lleguen los datos mios de q me conecté
          var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
          };
          //Se envia un msj al servidor, el cual se envia a todos los usuarios conectados
          //stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          stompClient.send("/app/chat.user", {}, JSON.stringify(chatMessage));
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
                    status: "JOIN"
                };
                stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage))
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
    }


    const handleUserLeave = (payloadData) => {
        privateChats.delete(payloadData.senderName);
        setPrivateChats(new Map(privateChats));
    }

    /*
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
        stompClient.disconnect();
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
            receivername: '',
            connected: false,
            message: ''
          });
    }

    const onError = (err) => {
        console.log("Error: "+err);
        alert(err)
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }

    //Envia msj a todos
    const sendValue=()=>{
            if (stompClient) {
              var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
              };
              stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        //console.log('se envia msj privado');
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
        //si se envia un msj a alguien que no sea yo mismo
          if(userData.username !== tab){
            //se guarda el msj enviado en el map de los msj privados. Si se enviara un msj a mi mismo entonces el map guardará el 
            //msj escrito cuando se reciba por parte del servidor. Si envío un msj a alguien distinto a mi mismo entonces el método
            //on onPrivateMessage se ejecutará en la compu del que recibe el msj no en la mia.
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage))
          setUserData({...userData,"message": ""});
        }
    }

    const registerUser = (data) =>{
        stompClient=null;
        userData.username=data.username;        
        const {name}=data.username;
        setUserData({...userData,"username": name});
        connect(data)
    }

    useEffect(() => {
        if(tab!=="CHATROOM" && privateChats.get(tab)===undefined){
            setTab("CHATROOM")
        }
    })

    return (
    <div className="container">
        {userData.connected?
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
        <Register
        registerUser={registerUser}
        />            
        }
    </div>
    )
}

export default ChatRoom