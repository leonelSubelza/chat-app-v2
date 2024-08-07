package com.chatapp.core.controller;

import com.chatapp.core.model.Message;
import com.chatapp.core.service.ChatService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Controller
@Slf4j
@CrossOrigin("*")
public class ChatController {

    //Cualquier usuario que se quiera conectar a este controlador tendrá que establecer la URL con /app/Loquesea

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/message")
    @SendTo("/chatroom/public")//se especifica el subdestino al que se enviará el msj. El destino general es /chatroom y el subdestino es /public
    public Message receiveMessage(@Payload @Valid Message message){
        return message;
    }

    @MessageMapping("/private-message")
    // Cuando un usuario mande un msj a /app/private-message, este msj se enviará a quien esté suscrito a
    // /user/nombreReceptor/private. Cada usuario que se suscriba pro primera vez deberá poner su nombre en
    // esa url para recibir este msj priv
    public void recRoomPrivateMessage(@Payload  @Valid Message message) {
        simpMessagingTemplate.convertAndSend(
                "/user/"+message.getReceiverId()+"/"+message.getUrlSessionId()+"/private",message);
    }

    /*AMBAS FUNCIONES SON IGUALES*/

    //En esta función se tiene un control más programático del envío del mensaje
    @MessageMapping("/group-message")
    public void recGroupMessage(@Payload @Valid Message message) {
        this.chatService.recGroupMessage(message);
        simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),message);
    }

    //Esta funcion usa SpEL (Lenguaje de Expresión de Spring) en la url
    /*
    @MessageMapping("/group-message")
    @SendTo("/chatroom/{urlSessionId}")
    public Message recGroupMessageV2(@Payload Message message){
        return message;
    }
*/
    @MessageMapping("/chat.join")
    //@SendTo("/chatroom/{urlSessionId}")
    public void userJoin(@Payload @Valid Message message, SimpMessageHeaderAccessor headerAccessor){
        this.chatService.userJoin(message,headerAccessor);
        simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),message);
    }

    @MessageMapping("/check-channel")
    public void checkIfChannelExists(@Payload @Valid Message message){
        this.chatService.checkIfChannelExists(message);
        simpMessagingTemplate.convertAndSendToUser(message.getSenderId(),"/exists-channel",message);
    }

    //Un usuario se desconectó pero no cerró la ventana del navegador
    @MessageMapping("/user.disconnected")
    public void disconnectUserFromRoom(@Payload @Valid Message message,SimpMessageHeaderAccessor headerAccessor){
        Message chatMessage = this.chatService.disconnectUserFromRoom(message,headerAccessor);
        //informamos a todos los demas que alguien se desconectó
        this.simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),chatMessage);
    }

/*    @MessageExceptionHandler
    public void handleException(Exception exception) {
        System.out.println("se produjo un error o.O");
        System.out.println(exception);
    }*/
}
