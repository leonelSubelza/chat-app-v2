package com.chatapp.core.auth.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

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
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                Authentication authentication = this.jwtService.startAuthentication(authorizationHeader);
                accessor.setUser(authentication);
            }
        }
        return message;
    }

}
