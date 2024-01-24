package com.chatapp.core.service;

import com.chatapp.core.config.WebSocketRoomHandler;
import com.chatapp.core.config.WebSocketSessionHandler;
import com.chatapp.core.controller.model.ChatUserRole;
import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
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
            Set<User> usersBannedInRoom = WebSocketRoomHandler.getRoom(message.getUrlSessionId()).getBannedUsers();
            if(message.getStatus().equals(Status.BAN)){
                usersBannedInRoom.add(userToBan);
            }
            if(message.getStatus().equals(Status.UNBAN)){
                usersBannedInRoom.remove(userToBan);
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
