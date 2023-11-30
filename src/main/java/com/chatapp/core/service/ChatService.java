package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Room;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@Slf4j
public class ChatService {

    public User handleUserJoin(Message message, SimpMessageHeaderAccessor headerAccessor){
        String id = headerAccessor.getSessionId();
        //Aca no se si guardar el id de la session de spring o el del frontend
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
                log.info("User added to room!:{}",room.getId());
                log.info("All the rooms:{}",WebSocketRoomHandler.activeRooms);
            }
        }
        saveUser(newUser,headerAccessor);
        return newUser;
    }

    public void saveUser(User user,SimpMessageHeaderAccessor headerAccessor){
        headerAccessor.getSessionAttributes().put("User",user);
        WebSocketSessionHandler.addSession(user);
        log.info("User connected!:{}",user.getUsername());
        log.info("number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());
    }
    public void  saveRoom(Room room){
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
}
