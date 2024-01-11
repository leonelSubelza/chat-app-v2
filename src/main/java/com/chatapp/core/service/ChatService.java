package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.controller.model.*;
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
            message.setMessage("Error occurred while trying to join the user");
        }
    }

    public void checkIfChannelExists(Message message){
        Room roomExist = WebSocketRoomHandler.activeRooms.get(message.getUrlSessionId());
        //System.out.println("existe una room con id:"+message.getUrlSessionId()+"?,: "+roomExist);
        if(roomExist!=null){
            message.setStatus(Status.EXISTS);
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
        if(message.getStatus().equals(Status.BANNED) || message.getStatus().equals(Status.MAKE_ADMIN)){
            boolean handleAdminAction = this.adminChatService.handleAdminAction(message);
            if(!handleAdminAction){
                log.error("Error occurred while handling an admin action from the user: {}",message.getSenderName());
                message.setStatus(Status.ERROR);
                message.setMessage("Error occurred while handling an admin action");
            }
        }
    }
}
