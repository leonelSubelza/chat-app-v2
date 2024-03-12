package com.chatapp.core.exceptions;

import com.chatapp.core.controller.model.Message;
import com.chatapp.core.controller.model.Status;
import com.chatapp.core.controller.model.User;
import com.chatapp.core.utils.EntityCreator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;

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
}
