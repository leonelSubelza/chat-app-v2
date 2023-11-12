package com.chatapp.core.controller;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Room;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
import com.chatapp.core.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashSet;

@Controller
@Slf4j
public class ChatController {

    //Cualquier usuario que se quiera conectar a este controlador tendrá que establecer la URL con /app/Loquesea

    //Para enviar mensajes a alguien en privado
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private ChatService chatService;

    //la anotación @Payload se utiliza para indicar qué parámetro o campo de una clase es
    // el cuerpo de un mensaje, lo que permite que Spring convierta automáticamente el contenido del
    // mensaje en un objeto Java del tipo adecuado.

    //Este método recibe msj del cliente, recibe todos los msj enviados por el cliente (si tiene)
    // y los reenvía a todos los demás clientes conectados/suscritos a /chatroom/public
    @MessageMapping("/message")
    //cuando el usuario envía un msj a /app/message, se enviará este msj a aquellos que estén suscritos a /chatroom/public
    @SendTo("/chatroom/public")//se especifica el subdestino al que se enviará el msj. El destino general es /chatroom y el subdestino es /public
    public Message receiveMessage(@Payload Message message){
        return message;
    }

    @MessageMapping("/private-message")
    // Cuando un usuario mande un msj a /app/private-message, este msj se enviará a quien esté suscrito a
    // /user/nombreReceptor/private. Cada usuario que se suscriba pro primera vez deberá poner su nombre en
    // esa url para recibir este msj priv
    public Message recMessage(@Payload Message message){
        //El método convertAndSendToUser detecta automáticamente el
        // "prefijo de destino del usuario" que se seteó en el método
        //configureMessageBroker()en el método registry.setUserDestinationPrefix("/user");

        //El método convertAndSendToUser() toma tres argumentos:
        // el nombre del usuario, el destino y el mensaje. En este caso,
        // se utiliza message.getReceiverName() como nombre de usuario para enviar el mensaje,
        // "/private" como destino y el propio objeto message como mensaje.
        //simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/"+message.getReceiverName()+"/"+message.getUrlSessionId()+"/private",message);
        simpMessagingTemplate.convertAndSend(
                "/user/"+message.getReceiverName()+"/"+message.getUrlSessionId()+"/private",message);
        //El cliente para conectarse deberá establecer una URL de tipo /user/David/private

        //'/user/'+userData.username+"/"+userData.URLSessionid+'/private'

        return message;
    }

    /*AMBAS FUNCIONES SON IGUALES*/

    //En esta función se tiene un control más programático del envío del mensaje
    @MessageMapping("/group-message")
    public Message recGroupMessage(@Payload Message message){
        simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),message);
        return message;
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
    public Message userJoin(@Payload Message message, SimpMessageHeaderAccessor headerAccessor){
        boolean userJoinCorrect = this.chatService.handleUserJoin(message,headerAccessor);
        //si hubo un error intentando conectar
        if(!userJoinCorrect){
            message.setStatus(Status.ERROR);
        }
        simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),message);
        return message;
    }

    @MessageMapping("/check-channel")
    public void checkIfChannelExists(@Payload Message message){
        Room roomExist = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
        if(roomExist!=null){
            message.setStatus(Status.EXISTS);
        }else {
            message.setStatus(Status.ERROR);
        }
        simpMessagingTemplate.convertAndSendToUser(message.getSenderName(),"/exists-channel",message);
    }
}
