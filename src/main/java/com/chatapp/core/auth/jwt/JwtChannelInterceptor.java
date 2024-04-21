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

//public class JwtChannelInterceptor implements ChannelInterceptor {
    public class JwtChannelInterceptor {

/*    private final JwtService jwtService;
    public JwtChannelInterceptor(JwtService jwtService){
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwtToken = accessor.getFirstNativeHeader("Authorization");

            if (jwtToken != null && jwtToken.startsWith("Bearer ")) {
                jwtToken = jwtToken.split("Bearer ")[1];
                DecodedJWT decodedJWT = jwtService.validateToken(jwtToken);
                //El token es válido
                String username = jwtService.extractUsername(decodedJWT);

                UserEntity userToAuthenticate = jwtService.findByUsername(username);


                SecurityContext context = SecurityContextHolder.getContext();
                //las credentials/contraseña o.O no es necesario por seguridad
                Authentication authentication = new
                        UsernamePasswordAuthenticationToken(username, null, userToAuthenticate.getAuthorities());

                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }
        }
        return message;
    }*/

}
