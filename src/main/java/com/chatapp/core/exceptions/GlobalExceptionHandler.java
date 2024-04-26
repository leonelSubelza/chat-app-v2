package com.chatapp.core.exceptions;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.chatapp.core.model.Message;
import com.chatapp.core.model.Status;
import com.chatapp.core.model.User;
import com.chatapp.core.utils.DateGenerator;
import com.chatapp.core.utils.EntityCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.Objects;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    //Catch validation exceptions
    @MessageExceptionHandler(MethodArgumentNotValidException.class)
    protected void handleMessageHandlingException(MethodArgumentNotValidException ex,
                                                  SimpMessageHeaderAccessor headerAccessor) {
        HttpStatus badRequest = HttpStatus.BAD_REQUEST;
        User user = getUserFromError(headerAccessor);
        if(user==null) return;
        log.error("Message Error: MethodArgumentNotValidException. The user {} with id {} sent a message too long",
                user.getUsername(),user.getId());
        Message message = generateErrorMessage(user,"The message sent is too long");
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }

    //Catch general exceptions
    @MessageExceptionHandler(Exception.class)
//    protected void handleChatAppException(Exception ex,@Headers Map<String, Object> headers) {
    protected void handleChatAppException(MethodArgumentNotValidException ex,
                                          SimpMessageHeaderAccessor headerAccessor) {
        HttpStatus badRequest = HttpStatus.INTERNAL_SERVER_ERROR;
        User user = getUserFromError(headerAccessor);
        if(user==null) return;
        log.error("General Message error from the user {} with id {}",user.getUsername(),user.getId());
        Message message = generateErrorMessage(user,badRequest.toString());
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }

    @ExceptionHandler(JWTVerificationException.class)
    public void handleJWTVerificationExceptionMessage(
            MethodArgumentNotValidException ex,
            SimpMessageHeaderAccessor headerAccessor) {
        log.error("Message error: JWTVerificationException function executed");
        HttpStatus badRequest = HttpStatus.INTERNAL_SERVER_ERROR;
        User user = getUserFromError(headerAccessor);
        if(user==null) return;
        Message message = generateErrorMessage(user,badRequest.toString());
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }

    //Exception for authentication
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleUsernameNotFoundException(
            UsernameNotFoundException ex,
            WebRequest webRequest) {
        log.error("Authentication error: UsernameNotFoundException function executed");
        HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;
        ErrorDetails errorDetails = generateErrorDetails(httpStatus,ex, webRequest);
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDetails> handleBadCredentialsException(
            BadCredentialsException ex,
            WebRequest webRequest) {
        log.error("Authentication error: BadCredentialsException function executed");
        HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;
        ErrorDetails errorDetails = generateErrorDetails(httpStatus,ex, webRequest);
        return new ResponseEntity<>(errorDetails,httpStatus);
    }

//    Global exception for http
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest webRequest){
        log.error("Http error: GlobalException function executed");
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorDetails errorDetails = generateErrorDetails(httpStatus,ex, webRequest);
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

    public ErrorDetails generateErrorDetails(HttpStatus httpStatus,
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

    public Message generateErrorMessage(User user, String message){
        return Message.builder()
                .senderId(user.getId())
                .senderName(user.getUsername())
                .status(Status.ERROR)
                .message(message)
                .date(DateGenerator.getUTCFormatDate())
                .urlSessionId(user.getRoomId())
                .build();
    }

    public User getUserFromError(SimpMessageHeaderAccessor headerAccessor){
        String headerAccessorId = headerAccessor.getSessionId();
        return (User) headerAccessor.getSessionAttributes().get(headerAccessorId);
    }

    //it still an issue with the exception who comes from the messages that this errors don't are caught nor thrown,
    // we must have two different exception handler
}
