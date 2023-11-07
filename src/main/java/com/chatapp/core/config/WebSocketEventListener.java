package com.chatapp.core.config;

import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Status;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

//Se supone que esta clase escucha cada vez que un usuario deja el chat
@Component
@RequiredArgsConstructor
@Slf4j//para el login
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messageTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent disconnectEvent){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("senderName");
        //ahora no se quien se desconectó, probar si conviene agregar un id al obj headeraccesor por cada usuario conectado
        if(username!=null){
            log.info("User disconnected!:{}",username);
            var chatMessage = Message.builder()
                    .status(Status.LEAVE)
                    .senderName(username)
                    .build();
            //informamos a todos los demas que alguien se desconectó
            WebSocketSessionHandler.removeSession(username);
            System.out.println("cant de usuarios conectados: "+WebSocketSessionHandler.getActiveSessionsCount());
            this.messageTemplate.convertAndSend("/chatroom/public",chatMessage);
        }
    }

    //si quisera crear un eventListener disitinto habria que ponerle la misma anotacion que arriba

    /*@EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("senderName");
        //String username = (String) headerAccessor.getUser().getName();
        //SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(connectEvent.getMessage());

        //String username = headers.getUser().getName();
        System.out.println("nombre del que se conectó?: "+username);
    }
*/
}
