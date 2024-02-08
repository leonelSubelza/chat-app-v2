package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.*;
import com.chatapp.core.utils.DateGenerator;
import com.chatapp.core.utils.EntityCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@Slf4j
public class RoomChatService {

    @Autowired
    private SimpMessageSendingOperations messageTemplate;

    @Autowired
    private AdminChatService adminChatService;

    public User handleUserJoin(Message message, SimpMessageHeaderAccessor headerAccessor){
        String id = headerAccessor.getSessionId();
        //Aca guardamos en el obj de Spring HeaderAccesor en el map <String,Object> como clave la clave que genera spring
        User newUser = EntityCreator.createUser(message);
        Room room = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
        //Si el id generado en el front ya existia
        if(WebSocketSessionHandler.existsUser(newUser.getId())){
            log.warn("The User with the id:{} and name:{} already exists in the WSSessionHandler!",message.getSenderId(),message.getSenderName());
        }
        //If the user is loaded in the chat and is in some room it's an error
        if(WebSocketSessionHandler.existsUser(newUser.getId()) && WebSocketRoomHandler.isUserInSomeRoom(message.getSenderId())){
            WebSocketRoomHandler.showRoomAndUserInfo();
            log.error("The User with the id:{} and name:{} already exists in some room!",message.getSenderId(),message.getSenderName());
            message.setMessage("Trying to connect with an user id which already exists in some room!");
            return null;
        }

        if(message.getStatus().equals(Status.CREATE)){
            if(room==null){
                room = EntityCreator.createNewRoom(newUser);
                saveRoom(room);
            }else{
                log.error("The Room with the key:{} already exists!",newUser.getRoomId());
                message.setMessage("Trying to create a room with an id which already exists!");
                return null;
            }
        }
        if(message.getStatus().equals(Status.JOIN)){
            //si el usuario se quiere unir a una ruoom que no eixte todo mal
            if(room==null){
                log.error("Trying to connect a Room with the key:{} that doesn't exists!",newUser.getRoomId());
                message.setMessage("Trying to connect in a room with an id that doesn't exists!");
                return null;
            }else{
                Room roomToJoin = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
                roomToJoin.getUsers().add(newUser);
                log.info("User {} added to room {}!",newUser.getUsername(),room.getId());
                //WebSocketRoomHandler.showRoomAndUserInfo();
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
        log.info("Count of all the users connected in the ws:{}",WebSocketSessionHandler.getActiveSessionsCount());
    }
    public void saveRoom(Room room){
        WebSocketRoomHandler.addRoom(room);
        log.info("New Room created!:{}",room.getId());
        log.info("Count of rooms created:{}",WebSocketRoomHandler.getActiveRoomsCount());
    }

    public Message handleDisconnectUserFromRoom(User user){
        System.out.println("rol del usuario que se va: "+user.getChatRole());
        //Tener en cuenta que existe una referencia en el obj headerAccesor manejado por Spring que no se borra
        //sino que se borrará cuando el usuario cierre la ventana del navegador
        Message chatMessage = EntityCreator.createMessage(user);

        //Deleting the user from the list of all users connected
        WebSocketSessionHandler.removeSession(user);
        log.info("User {} disconnected! at {}",user.getUsername(), DateGenerator.getActualDate());
        log.info("Count of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());

        Room userRoom = WebSocketRoomHandler.activeRooms.get(user.getRoomId());
        if(userRoom == null){
            String errorMsj = "Trying to delete a user from an non-existent room";
            log.warn(errorMsj);
            chatMessage.setStatus(Status.ERROR);
            chatMessage.setMessage(errorMsj);
            return chatMessage;
        }

        if(!userRoom.getUsers().isEmpty()) {
            //Deleting the user from room
            boolean remove = WebSocketRoomHandler.getRoom(user.getRoomId()).getUsers().remove(user);
            if(!remove){
                String errorMsj = "Trying to delete a user who doesn't exists in the room";
                log.warn(errorMsj);
                chatMessage.setStatus(Status.ERROR);
                chatMessage.setMessage(errorMsj);
                return chatMessage;
            }
        }
        //After the user is deleted from room or not, if the room is empty we deleted
        if(userRoom.getUsers().isEmpty()) {
            WebSocketRoomHandler.removeRoom(userRoom);
            log.info("Room with id:{} deleted, number of rooms actives: {}",
                    userRoom.getId(), WebSocketRoomHandler.getActiveRoomsCount());
        }else{
            if(user.getChatRole().equals(ChatUserRole.ADMIN)){
                //If the admin is about to exit, then it must be decided another admin in the room
                this.adminChatService.decideANewAdminInRoom(user,userRoom);
            }
        }
        return chatMessage;
    }
}
