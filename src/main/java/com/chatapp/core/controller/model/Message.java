package com.chatapp.core.controller.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String senderId;
    private String senderName;
    private String receiverName;
    private String receiverId;
    private String message;
    private String date;
    private Status status;
    private String urlSessionId;
    private String avatarImg;
    private ChatUserRole chatRole;
}