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
