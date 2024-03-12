package com.chatapp.core.controller.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @NotNull(message = "Id is mandatory")
    @NotBlank(message = "Id is mandatory")
    private String senderId;
    private String senderName;
    private String receiverName;
    private String receiverId;

    @Size(max=255, message = "Message is too large")
    private String message;
    private String date;
    private Status status;
    private String urlSessionId;
    private String avatarImg;
    private ChatUserRole chatRole;
}