package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

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
        log.info("Number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());
    }
    public void saveRoom(Room room){
        WebSocketRoomHandler.addRoom(room);
        log.info("New Room created!:{}",room.getId());
        log.info("Number of rooms created:{}",WebSocketRoomHandler.getActiveRoomsCount());
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

    public String getActualDate() {
        // Obtener la fecha y hora actual en UTC
        LocalDateTime actualDate = LocalDateTime.now();
        // Formatear la fecha y hora en el formato deseado (solo hora, minutos y segundos)
        DateTimeFormatter formatTime = DateTimeFormatter.ofPattern("HH:mm:ss");
        return actualDate.format(formatTime);
    }

    public String getUTCFormatDate() {
        LocalDateTime actualDate = LocalDateTime.now();
        DateTimeFormatter formatUTC = DateTimeFormatter.ISO_DATE_TIME;
        return actualDate.format(formatUTC);
    }

    public void disconnectUserFromRoom(User user){
        //Tener en cuenta que existe una referencia en el obj headerAccesor manejado por Spring que no se borra
        //sino que se borrará cuando el usuario cierre la ventana del navegador

        Room userRoom = WebSocketRoomHandler.activeRooms.get(user.getRoomId());

        log.info("User {} disconnected! at {}",user.getUsername(),getActualDate());

        Message chatMessage = Message.builder()
                .senderId(user.getId())
                .senderName(user.getUsername())
                .status(Status.LEAVE)
                .date(getUTCFormatDate())
                .urlSessionId(user.getRoomId())
                .build();
        WebSocketSessionHandler.removeSession(user);
        log.info("Number of connected users:{}",WebSocketSessionHandler.getActiveSessionsCount());

        //informamos a todos los demas que alguien se desconectó
        this.messageTemplate.convertAndSend("/chatroom/"+user.getRoomId(),chatMessage);

        //checkeo si la room a la que pertenecía ya no existe
        boolean remove = WebSocketRoomHandler.activeRooms.get(user.getRoomId()).getUsers().remove(user);
        if(!remove){
            log.warn("Trying to delete a user from an non-existent room");
            return;
        }
        if(userRoom.getUsers().isEmpty()) {
            WebSocketRoomHandler.removeRoom(userRoom);
            log.info("Room with id:{} deleted, number of rooms actives: {}",
                    userRoom.getId(), WebSocketSessionHandler.getActiveSessionsCount());
        }
    }

    public boolean handleAdminAction(Message message) {
        User user = WebSocketSessionHandler.getUser(message.getSenderId());
        if(!user.getChatRole().equals(ChatUserRole.ADMIN)){
            log.warn("Trying to execute an admin action without being an admin");
            return false;
        }
        if(message.getStatus().equals(Status.BANNED)){
            //El baneo funciona como un flag, si esta baneado se banea, sino se desbanea
            User userToBan = WebSocketSessionHandler.getUser(message.getReceiverId());
            User userBannedExists = WebSocketRoomHandler.getRoom(message.getUrlSessionId()).getBannedUsers()
            .stream()
            .filter(u -> u.getId().equals(user.getId()))
            .findFirst().orElse(null);
            Set<User> usersBanned = WebSocketRoomHandler.getRoom(message.getUrlSessionId()).getBannedUsers();
            if(userBannedExists != null){
                usersBanned.add(userToBan);
            }else{
                usersBanned.remove(userToBan);
            }
            return true;
        }
        if (message.getStatus().equals(Status.MAKE_ADMIN)){
            User userToMakeAdmin = WebSocketSessionHandler.getUser(message.getReceiverId());
            user.setChatRole(ChatUserRole.CLIENT);
            userToMakeAdmin.setChatRole(ChatUserRole.ADMIN);
        }
        return true;
    }
}
