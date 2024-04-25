package com.chatapp.core.exceptions;

import com.chatapp.core.model.Message;
import com.chatapp.core.model.Status;
import com.chatapp.core.model.User;
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
        String headerAccessorId = headerAccessor.getSessionId();
        User user = (User) headerAccessor.getSessionAttributes().get(headerAccessorId);
        if(user==null) return;
        log.error("The user {} with id {} sent a message too long",user.getUsername(),user.getId());
        Message message = EntityCreator.createMessage(user);
        message.setMessage("The message sent is too long");
        message.setStatus(Status.ERROR);
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }

    //Catch general exceptions
    @MessageExceptionHandler(Exception.class)
//    protected void handleChatAppException(Exception ex,@Headers Map<String, Object> headers) {
    protected void handleChatAppException(MethodArgumentNotValidException ex,
                                          SimpMessageHeaderAccessor headerAccessor) {
        HttpStatus badRequest = HttpStatus.INTERNAL_SERVER_ERROR;
        /*ErrorDetails errorDetails = new ErrorDetails(
                ex.getMessage(),
                ex,
                badRequest,
                ZonedDateTime.now(ZoneId.of("Z"))
        );*/
        String headerAccessorId = headerAccessor.getSessionId();
        User user = (User) headerAccessor.getSessionAttributes().get(headerAccessorId);
        if(user==null) return;
        log.error("General error from the user {} with id {}",user.getUsername(),user.getId());
        Message message = EntityCreator.createMessage(user);
        message.setMessage(badRequest.toString());
        message.setStatus(Status.ERROR);
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
}
