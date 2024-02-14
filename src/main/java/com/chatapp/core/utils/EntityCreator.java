package com.chatapp.core.utils;

import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Room;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;

import java.util.HashSet;

public class EntityCreator {
    public static Room createNewRoom(User user){
        Room newRoom = Room.builder()
                .id(user.getRoomId())
                .users(new HashSet<>())
                .bannedUsers(new HashSet<>())
                .build();
        newRoom.getUsers().add(user);
        return newRoom;
    }

    public static User createUser(Message message){
        return User.builder()
                .id(message.getSenderId())
                .username(message.getSenderName())
                .roomId(message.getUrlSessionId())
                .chatRole(message.getChatRole())
                .build();
    }

    public static Message createMessage(User user){
        return Message.builder()
                .senderId(user.getId())
                .senderName(user.getUsername())
                .status(Status.LEAVE)
                .date(DateGenerator.getUTCFormatDate())
                .urlSessionId(user.getRoomId())
                .build();
    }
}
