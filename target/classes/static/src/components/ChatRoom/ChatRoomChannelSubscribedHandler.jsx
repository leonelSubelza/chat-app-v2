import React, { useState,useEffect,useContext,useRef } from 'react'
import { userContext } from "../../context/UserDataContext";

const { userData,setUserData,setChannelExists,chatroomData, setChatroomData,
    messageData, setMessageData } = useContext(userContext);

export const checkIfChannelExists = (urlSessionIdAux)=>{
    stompClient.current.subscribe('/user/'+userData.username+'/exists-channel', (payload)=>{
        var payloadData = JSON.parse(payload.body);

        //este caso es raro que pase
        if((payloadData.status==='EXISTS' && userData.status==='CREATE')){
            alert('Se intenta crear una sala con un id que ya existe');
            disconnectChat();
            return;
        }
        if( (payloadData.status==='NOT_EXISTS' && userData.status==='JOIN')){
            alert('el canal al que se intenta conectar no existe');
            disconnectChat();
            return;
        }
        setChannelExists(true);
        subscribeRoomChannels(urlSessionIdAux)
    });

    var chatMessage = {
        senderName: userData.username,
        urlSessionId:urlSessionIdAux,
    };

    stompClient.current.send("/app/check-channel", {}, JSON.stringify(chatMessage))

}

export const subscribeRoomChannels = (urlSessionIdAux) => {
    stompClient.current.subscribe('/chatroom/public', onMessageReceived);
    stompClient.current.subscribe('/chatroom/'+urlSessionIdAux, onMessageReceived);
    stompClient.current.subscribe('/user/'+userData.username+"/"+urlSessionIdAux+'/private', onPrivateMessage);
    //escuchamos el canal que nos envía quién se desconectó
    //stompClient.subscribe('/chatroom/disconnected', onUserDisconnected);
    userJoin(urlSessionIdAux);
}

export const userJoin=(urlSessionIdAux)=>{
    //Al unirse a la sesion, se envia un msj a todos los usuarios conectados para que les 
    //lleguen los datos mios de q me conecté
      var chatMessage = {
        senderName: userData.username,
        urlSessionId:urlSessionIdAux,
        status:userData.status
      };
      //Se envia un msj al servidor, el cual se envia a todos los usuarios conectados
      //stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      stompClient.current.send("/app/chat.join", {}, JSON.stringify(chatMessage));
}

//llega un msj publico
export const onMessageReceived = (payload)=>{
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status){
        case "JOIN":
            handleJoinUser(payloadData,true);
            break;
        case "MESSAGE":
            payloadData.date = convertUTCTimeToLocalTime(getActualDate(payloadData.date));
            chatroomData.publicChats.push(payloadData);
            setPublicChats([...chatroomData.publicChats]);
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

export const onPrivateMessage = (payload)=>{
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

export const handleJoinUser = (payloadData,resend)=>{
    //si recibo yo mismo mi mensaje o info de que me uní me voy
    if (payloadData.senderName === userData.username) {
        return;
    }
    //Si no se tiene guardado quien se unio se guarda (tambien nos llega un msj de que este cliente mismo se unio)
    if (!chatroomData.privateChats.get(payloadData.senderName)) {
        chatroomData.privateChats.set(payloadData.senderName, []);
        setPrivateChats(new Map(chatroomData.privateChats));
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

export const handlePrivateMessageReceived = (payloadData) =>{
    payloadData.date = convertUTCTimeToLocalTime(getActualDate(payloadData.date));
    if(chatroomData.privateChats.get(payloadData.senderName)){
        let msg = chatroomData.privateChats.get(payloadData.senderName).push(payloadData);
        setPrivateChats(new Map(chatroomData.privateChats));
    }else{
        let list =[];
        list.push(payloadData);
        privateChats.set(payloadData.senderName,list);
        setPrivateChats(new Map(chatroomData.privateChats));
    }
}


export const handleUserLeave = (payloadData) => {
    chatroomData.privateChats.delete(payloadData.senderName);
    setPrivateChats(new Map(chatroomData.privateChats));
}

export const disconnectChat = () => {
    userData.connected=false; 
    if(stompClient.current!==null) {
        stompClient.current.disconnect();
        navigate('/');
    }
    //setStompClient(null);
    resetValues();
    navigate('/');
}