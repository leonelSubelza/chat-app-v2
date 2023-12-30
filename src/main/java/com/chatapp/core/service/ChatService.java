package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Room;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@Slf4j
public class ChatService {

    @Autowired
    private SimpMessageSendingOperations messageTemplate;

    public User handleUserJoin(Message message, SimpMessageHeaderAccessor headerAccessor){
        String id = headerAccessor.getSessionId();
        //Aca guardamos en el obj de Spring HeaderAccesor en el map <String,Object> como clave la clave que genera spring
        User newUser = createUser(message);
        Room room = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
        //Si el id generado en el front ya existia
        if(WebSocketSessionHandler.existsUser(newUser.getId()) != null){
            log.error("The User with the id:{} already exists!",message.getSenderId());
            return null;
        }
        if(message.getStatus().equals(Status.CREATE)){
            if(room==null){
                room = createNewRoom(newUser);
                saveRoom(room);
            }else{
                log.error("The Room with the key:{} already exists!",newUser.getRoomId());
                return null;
            }
        }
        if(message.getStatus().equals(Status.JOIN)){
            //si el usuario se quiere unir a una ruoom que no eixte todo mal
            if(room==null){
                log.error("Trying to connect a Room with the key:{} that doesn't exists!",newUser.getRoomId());
                return null;
            }else{
                WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId()).getUsers().add(newUser);
                log.info("User {} added to room {}!",newUser.getUsername(),room.getId());
                log.info("All the rooms:{}",WebSocketRoomHandler.activeRooms);
            }
        }
        saveUser(newUser,headerAccessor);
        return newUser;
    }

    public void saveUser(User user,SimpMessageHeaderAccessor headerAccessor){
        String headerAccessorId = headerAccessor.getSessionId();
        if(headerAccessorId == null){
            throw new NullPointerException();
        }
        headerAccessor.getSessionAttributes().put(headerAccessorId,user);
        WebSocketSessionHandler.addSession(user);
        log.info("User connected!:{}",user.getUsername());
        log.info("number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());
    }
    public void saveRoom(Room room){
        WebSocketRoomHandler.addRoom(room);
        log.info("New Room created!:{}",room.getId());
        log.info("number of rooms created:{}",WebSocketRoomHandler.getActiveRoomsCount());
    }

    public Room createNewRoom(User user){
        Room newRoom = Room.builder()
                .id(user.getRoomId())
                .users(new HashSet<>())
                .build();
        newRoom.getUsers().add(user);
        return newRoom;
    }

    public User createUser(Message message){
        return User.builder()
                .id(message.getSenderId())
                .username(message.getSenderName())
                .roomId(message.getUrlSessionId())
                .build();
    }

    public void disconnectUserFromRoom(User user){
        //Tener en cuenta que existe una referencia en el obj headerAccesor manejado por Spring que no se borra
        //sino que se borrará cuando el usuario cierre la ventana del navegador

        Room userRoom = WebSocketRoomHandler.activeRooms.get(user.getRoomId());

        log.info("User disconnected!:{}",user.getUsername());
        Message chatMessage = Message.builder()
                .senderId(user.getId())
                .senderName(user.getUsername())
                .status(Status.LEAVE)
                //GENERAR UNA FECHA EN FORMATO UTC O SEA FORMATO UNIVERSAL
                .date("")
                .urlSessionId(user.getRoomId())
                .build();
        WebSocketSessionHandler.removeSession(user);
        log.info("number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());

        //informamos a todos los demas que alguien se desconectó
        this.messageTemplate.convertAndSend("/chatroom/"+user.getRoomId(),chatMessage);

        //checkeo si la room a la que pertenecía ya no existe
        boolean remove = WebSocketRoomHandler.activeRooms.get(user.getRoomId()).getUsers().remove(user);
        if(!remove){
            log.warn("Tryied to delete a user from an inxisting room");
            return;
        }
        if(userRoom.getUsers().isEmpty()) {
            WebSocketRoomHandler.removeRoom(userRoom);
            log.info("Room with id:{} deleted, number of rooms actives: {}",
                    userRoom.getId(), WebSocketSessionHandler.getActiveSessionsCount());
        }
    }
}
