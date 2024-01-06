package com.chatapp.core.config;

import com.chatapp.core.controller.model.User;
import com.chatapp.core.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

//Se supone que esta clase escucha cada vez que un usuario deja el chat
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    //private final SimpMessageSendingOperations messageTemplate;

    @Autowired
    private ChatService chatService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent disconnectEvent){
        //Spring sabe identificar especificamente quién se desconectó por lo que siempre obtendremos al usuario correcto
        //No hace falta borrar ningun objeto de headerAccesor ya que spring lo hace solo
        System.out.println("se ejecuta eventlistener de usuario desconectado");
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String id = headerAccessor.getSessionId();
        //UsersessionHandler es un objeto que maneja Spring, guardamos ahi una referencia al usuario para obtenerlo acá
        User userSessionHandler = (User) headerAccessor.getSessionAttributes().get(id);
        if(userSessionHandler==null) return;
        User user = WebSocketSessionHandler.getUser(userSessionHandler.getId());
        if(user==null) return;
        this.chatService.disconnectUserFromRoom(user);
    }
}
