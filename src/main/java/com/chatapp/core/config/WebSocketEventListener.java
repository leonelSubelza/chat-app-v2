package com.chatapp.core.config;

import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Room;
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
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messageTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent disconnectEvent){
        //Spring sabe identificar especificamente quién se desconectó por lo que siempre obtendremos al usuario correcto
        //No hace falta borrar ningun objeto de headerAccesor ya que spring lo hace solo
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String id = headerAccessor.getSessionId();
        User user = (User) headerAccessor.getSessionAttributes().get("User");
        System.out.println("se desconecta el usuario: "+user);
//Esto pasa cuando un usuario se quiere conectar a una room invalida, no se guarda al usuario por lo que se desconeta alguien null
        if(user==null) return;

        Room userRoom = WebSocketRoomHandler.activeRooms.get(user.getRoomId());

        log.info("User disconnected!:{}",user.getUsername());
        Message chatMessage = Message.builder()
                    .senderId(user.getId())
                    .senderName(user.getUsername())
                    //faltaria agregar la fecha en formato universal UTC
                    .status(Status.LEAVE)
                    .urlSessionId(user.getRoomId())
                    .build();
        WebSocketSessionHandler.removeSession(user.getUsername());
        log.info("number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());
        //informamos a todos los demas que alguien se desconectó
        //this.messageTemplate.convertAndSend("/chatroom/public",chatMessage);
        this.messageTemplate.convertAndSend("/chatroom/"+user.getRoomId(),chatMessage);

        //checkeo si la room a la que pertenecía ya no existe
        boolean remove = WebSocketRoomHandler.activeRooms.get(user.getRoomId()).getUsers().remove(user);
        if(!remove){
            log.warn("SE INTENTO BORRAR UN USUARIO DE UNA ROOM INEXISTENTE");
            return;
        }
        if(userRoom.getUsers().isEmpty()) {
            WebSocketRoomHandler.removeRoom(userRoom);
            log.info("Room with id:{} deleted, number of rooms actives: {}",
                    userRoom.getId(), WebSocketSessionHandler.getActiveSessionsCount());
        }
    }
}
