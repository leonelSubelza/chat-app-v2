package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
@Slf4j
public class AdminChatService {

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
                usersBannedInRoom.add(userToBan);
                userRoom.getUsers().remove(userToBan);
                //We don't check if the room is empty because we assume it must be at least two user in one room for ban
                WebSocketSessionHandler.removeSessionById(message.getReceiverId());
                log.info("User {} has been banned from the room {}!",message.getReceiverName(),message.getUrlSessionId());
                WebSocketRoomHandler.showRoomAndUserInfo();
            }
            if(message.getStatus().equals(Status.UNBAN)){
                usersBannedInRoom.remove(userToBan);
                //userRoom.getUsers().add(userToBan);
                log.info("User {} has been unbanned from the room {}!",message.getReceiverName(),message.getUrlSessionId());
                WebSocketRoomHandler.showRoomAndUserInfo();
            }
        }
        if (message.getStatus().equals(Status.MAKE_ADMIN)){
            User userToMakeAdmin = WebSocketSessionHandler.getUser(message.getReceiverId());
            user.setChatRole(ChatUserRole.CLIENT);
            userToMakeAdmin.setChatRole(ChatUserRole.ADMIN);
        }
        return true;
    }
}
