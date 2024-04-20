package com.chatapp.core.auth.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.chatapp.core.auth.user.UserEntity;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

//Represents the filter jwt
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtService jwtService;

    //We check if the client has a token jwt, if it has it then we validate it, if he doesn't have it then continue
    //with the next filter if exists
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (token != null && token.startsWith("Bearer ")) {
            //El token es "Bearer asfdkljñ...", nos quedamos con "asdfasdf..."
            token = token.split("Bearer ")[1];

            DecodedJWT decodedJWT = jwtService.validateToken(token);
            //El token es válido
            String username = jwtService.extractUsername(decodedJWT);

            UserEntity userToAuthenticate = UserDetailsServiceImpl
                    .USERS.stream()
                    .filter(u -> u.getUsername().equals(username))
                    .findFirst()
                    .orElseThrow(() -> new UsernameNotFoundException("The user " + username + " doesn't exists in the server"));


            SecurityContext context = SecurityContextHolder.getContext();
            //las credentials/contraseña o.O no es necesario por seguridad
            Authentication authentication = new
                    UsernamePasswordAuthenticationToken(username, null, userToAuthenticate.getAuthorities());

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            filterChain.doFilter(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
