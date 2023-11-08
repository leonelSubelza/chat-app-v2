package com.chatapp.core.config;

import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
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
        //Spring sabe identificar especificamente quién se desconectó por lo que siempre obtendremos al usuario correcto
        //No hace falta borrar ningun objeto de headerAccesor ya que spring lo hace solo
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String id = headerAccessor.getSessionId();
        User user = (User) headerAccessor.getSessionAttributes().get("User");
        if(user!=null){
            log.info("User disconnected!:{}",user.getUsername());
            Message chatMessage = Message.builder()
                    .status(Status.LEAVE)
                    .senderName(user.getUsername())
                    .build();
            WebSocketSessionHandler.removeSession(user.getUsername());
            log.info("number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());
            //informamos a todos los demas que alguien se desconectó
            this.messageTemplate.convertAndSend("/chatroom/public",chatMessage);
        }
    }
}
