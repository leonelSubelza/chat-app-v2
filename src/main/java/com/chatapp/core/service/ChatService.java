package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ChatService {
    @Autowired
    private RoomChatService roomChatService;

    @Autowired
    private AdminChatService adminChatService;

    public void userJoin(Message message, SimpMessageHeaderAccessor headerAccessor) {
        User userJoinCorrect = this.roomChatService.handleUserJoin(message,headerAccessor);
        //si hubo un error intentando conectar
        if(userJoinCorrect == null){
            message.setStatus(Status.ERROR);
        }
    }

    public void checkIfChannelExists(Message message){
        Room roomExist = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
        if(roomExist!=null){
            message.setStatus(Status.EXISTS);

            if(roomExist.isUserBannedFromRoom(message.getSenderId())){
                log.warn("The user {} is trying to connect to the Room with the key:{} in which is banned",
                        message.getSenderName(),roomExist.getId());
                message.setMessage("You are banned from this room!");
                message.setStatus(Status.ERROR);
                return;
            }

            User userConnecting = WebSocketSessionHandler.getUser(message.getSenderId());
            //The user mustn't have be connected if he wants to connect in some room
            if(userConnecting == null){
                return;
            }
            boolean userExistsInRoom = roomExist.getUsers().stream()
                    .anyMatch(u -> u.getId().equals(userConnecting.getId()));
            if(userExistsInRoom){
                message.setStatus(Status.ALREADY_CONNECTED);
                log.warn("User {} trying to connect to Room {} in which is already connected!",
                        userConnecting.getUsername(),roomExist.getId());
            }
        }else {
            message.setStatus(Status.NOT_EXISTS);
        }
    }

    public Message disconnectUserFromRoom(Message message,SimpMessageHeaderAccessor headerAccessor) {
        String headerAccessorId = headerAccessor.getSessionId();
        User user = (User) headerAccessor.getSessionAttributes().get(headerAccessorId);
        if(user==null){
            log.error("Trying to delete user {} who doesn't exists",message.getSenderName());
            message.setStatus(Status.ERROR);
            message.setMessage("Error occurred while trying to disconnect");
            return message;
        }else{
            return this.roomChatService.handleDisconnectUserFromRoom(user);
        }
    }

    public void recGroupMessage(Message message) {
        if(message.getStatus().equals(Status.BAN) || message.getStatus().equals(Status.UNBAN)
                || message.getStatus().equals(Status.MAKE_ADMIN)){
            boolean handleAdminAction = this.adminChatService.handleAdminAction(message);
            if(!handleAdminAction){
                log.error("Error occurred while handling an admin action from the user: {}",message.getSenderName());
                message.setStatus(Status.ERROR);
                message.setMessage("Error occurred while handling an admin action");
            }
        }
    }
}
