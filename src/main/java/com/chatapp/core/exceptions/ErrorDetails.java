package com.chatapp.core.exceptions;

import lombok.*;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ErrorDetails {
    private Date timestamp;
    private String message;
    private String details;
    private String statusCode;
}
