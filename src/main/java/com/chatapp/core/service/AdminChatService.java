package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.*;
import com.chatapp.core.utils.EntityCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
@Slf4j
public class AdminChatService {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    //The message already have the status BAN or UNBAN, so it's only returned to the client
    public boolean handleAdminAction(Message message) {
        User user = WebSocketSessionHandler.getUser(message.getSenderId());
        if(!user.getChatRole().equals(ChatUserRole.ADMIN)){
            log.warn("Trying to execute an admin action without being an admin");
            message.setMessage("Trying to execute an admin action without being an admin");
            message.setStatus(Status.ERROR);
            return false;
        }
        if(message.getStatus().equals(Status.BAN) || message.getStatus().equals(Status.UNBAN)){
            User userToBan = WebSocketSessionHandler.getUser(message.getReceiverId());
            Room userRoom = WebSocketRoomHandler.getRoom(message.getUrlSessionId());
            Set<User> usersBannedInRoom = WebSocketRoomHandler.getRoom(message.getUrlSessionId()).getBannedUsers();
            //If the user is banned, then it must be removed from the usersConnected list
            if(message.getStatus().equals(Status.BAN)){
                /*
                usersBannedInRoom.add(userToBan);
                userRoom.getUsers().remove(userToBan);
                //We don't check if the room is empty because we assume it must be at least two user in one room for ban
                WebSocketSessionHandler.removeSessionById(message.getReceiverId());
                log.info("User {} has been banned from the room {}!",message.getReceiverName(),message.getUrlSessionId());
                WebSocketRoomHandler.showRoomAndUserInfo();
                */
                banUser(userToBan,userRoom,usersBannedInRoom);
            }
            if(message.getStatus().equals(Status.UNBAN)){
                /*
                usersBannedInRoom.remove(userToBan);
                log.info("User {} has been unbanned from the room {}!",message.getReceiverName(),message.getUrlSessionId());
                WebSocketRoomHandler.showRoomAndUserInfo();
                */
                unbanUser(userToBan, usersBannedInRoom);
            }
        }
        if (message.getStatus().equals(Status.MAKE_ADMIN)){
            //User userToMakeAdmin = WebSocketSessionHandler.getUser(message.getReceiverId());
            //user.setChatRole(ChatUserRole.CLIENT);
            //userToMakeAdmin.setChatRole(ChatUserRole.ADMIN);
            makeAdmin(user,WebSocketSessionHandler.getUser(message.getReceiverId()));
        }
        return true;
    }

    public void banUser(User userToBan, Room userRoom,Set<User> usersBannedInRoom){
        usersBannedInRoom.add(userToBan);
        userRoom.getUsers().remove(userToBan);
        //We don't check if the room is empty because we assume it must be at least two user in one room for ban
        boolean removeSession = WebSocketSessionHandler.removeSessionById(userToBan.getId());
        if(!removeSession){
            System.out.println();
            log.error("The user {} couldn't be banned from the room with id {}",userToBan.getUsername(),userRoom.getId());
            System.out.println();
        }
        log.info("User {} has been banned from the room {}!",userToBan.getUsername(),userToBan.getRoomId());
        WebSocketRoomHandler.showRoomAndUserInfo();
    }

    public void unbanUser(User userToUnban, Set<User> usersBannedInRoom){
        usersBannedInRoom.remove(userToUnban);
        //userRoom.getUsers().add(userToBan);
        log.info("User {} has been unbanned from the room {}!",userToUnban.getUsername(),userToUnban.getRoomId());
        WebSocketRoomHandler.showRoomAndUserInfo();
    }

    public void makeAdmin(User userToMakeClient, User userToMakeAdmin) {
        userToMakeClient.setChatRole(ChatUserRole.CLIENT);
        userToMakeAdmin.setChatRole(ChatUserRole.ADMIN);
        log.warn("The user {} is the new admin of the room {}",userToMakeAdmin.getUsername(),userToMakeClient.getRoomId());
        WebSocketRoomHandler.showRoomAndUserInfo();
    }

    public void decideANewAdminInRoom(User userToMakeClient, Room userRoom){
        if(userRoom.getUsers().isEmpty()){
            return;
        }
        User newAdmin = userRoom.getUsers().stream()
                .filter(user -> !user.getId().equals(userToMakeClient.getId()))
                .findAny().orElse(null);
        if(newAdmin==null){
            return;
        }
        makeAdmin(userToMakeClient,newAdmin);
        //This function only works if an admin leave the Room, so we must inform everybody about the new Admin
        Message message = EntityCreator.createMessage(userToMakeClient);
        message.setReceiverId(newAdmin.getId());
        message.setReceiverName(newAdmin.getUsername());
        message.setStatus(Status.MAKE_ADMIN);
        message.setMessage("The user "+userToMakeClient.getUsername()+" leaved the Room, so the new Admin it'll be "+newAdmin.getUsername());
        simpMessagingTemplate.convertAndSend("/chatroom/"+message.getUrlSessionId(),message);
    }

}
