package com.chatapp.core.utils;

import com.chatapp.core.exceptions.ErrorDetails;
import com.chatapp.core.model.Message;
import com.chatapp.core.model.Room;
import com.chatapp.core.model.Status;
import com.chatapp.core.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
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

    public static ErrorDetails generateErrorDetails(HttpStatus httpStatus,
                                             Exception ex,
                                             WebRequest webRequest) {
        return ErrorDetails
                .builder()
                .timestamp(new Date())
                .message(ex.getMessage())
                .details(webRequest.getDescription(false))
                .statusCode(httpStatus.value()+"")
                .build();
    }

    public static Message generateErrorMessage(User user, String message){
        return Message.builder()
                .senderId(user.getId())
                .senderName(user.getUsername())
                .status(Status.ERROR)
                .message(message)
                .date(DateGenerator.getUTCFormatDate())
                .urlSessionId(user.getRoomId())
                .build();
    }
}
