package com.chatapp.core.auth.jwt;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;

public class JwtChannelInterceptor implements ChannelInterceptor {
//    public class JwtChannelInterceptor {

    private final JwtService jwtService;
    public JwtChannelInterceptor(JwtService jwtService){
        this.jwtService = jwtService;
    }

    //This function intercepts all the message to check if they have a valid token, if they do then they are passed
    //to the ChatController
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        System.out.println("se ejecuta filtro de msj");
        System.out.println("getCommand: "+accessor.getCommand());
        if (StompCommand.CONNECT.equals(accessor.getCommand())|| StompCommand.SEND.equals(accessor.getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                System.out.println("el chaval tenia un bearer token");
                Authentication authentication = this.jwtService.startAuthentication(authorizationHeader);
                accessor.setUser(authentication);
            }else{
                System.out.println("el chaval NO tenia un bearer token");
            }
        }
        return message;
    }

}
