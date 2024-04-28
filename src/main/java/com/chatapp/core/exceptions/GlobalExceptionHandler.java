package com.chatapp.core.exceptions;

import com.chatapp.core.model.Message;
import com.chatapp.core.model.User;
import com.chatapp.core.utils.EntityCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    //Catch validation exceptions
    @MessageExceptionHandler(MethodArgumentNotValidException.class)
    protected void handleMessageHandlingException(MethodArgumentNotValidException ex,
                                                  SimpMessageHeaderAccessor headerAccessor) {
        HttpStatus badRequest = HttpStatus.BAD_REQUEST;
        User user = EntityCreator.getUserFromError(headerAccessor);
        if(user==null) return;
        log.error("Message Error: MethodArgumentNotValidException. The user {} with id {} sent a message too long",
                user.getUsername(),user.getId());
        Message message = EntityCreator.generateErrorMessage(user,"The message sent is too long");
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }

    //Catch general exceptions
    @MessageExceptionHandler(Exception.class)
//    protected void handleChatAppException(Exception ex,@Headers Map<String, Object> headers) {
    protected void handleChatAppException(Exception ex,
                                          SimpMessageHeaderAccessor headerAccessor) {
        System.out.println("se ejecuta error general de msj");
        HttpStatus badRequest = HttpStatus.INTERNAL_SERVER_ERROR;
        User user = EntityCreator.getUserFromError(headerAccessor);
        if(user==null) return;
        log.error("General Message error from the user {} with id {}",user.getUsername(),user.getId());
        Message message = EntityCreator.generateErrorMessage(user,badRequest.toString());
        simpMessagingTemplate.convertAndSend(
                "/user/"+user.getId()+"/"+user.getRoomId()+"/private",message);
    }


    //    Global exception for http errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest webRequest){
        System.out.println("se ejecuta error Exception general para http");

        log.error("Http error: GlobalException function executed");
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorDetails errorDetails = EntityCreator.generateErrorDetails(httpStatus,ex, webRequest);
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

    //Exception for authentication
    //The errors during the auth cannot be caught like this, this error is caught here because
    // is thrown by the AuthService. Other errors like the JWTVerificationException cannot be caught here
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDetails> handleUsernameNotFoundException(
            BadCredentialsException ex,
            WebRequest webRequest) {
        log.error("Authentication error: BadCredentialsException function executed");
        HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;
        ErrorDetails errorDetails = EntityCreator.generateErrorDetails(httpStatus,ex, webRequest);
        return new ResponseEntity<>(errorDetails, httpStatus);
    }


}
