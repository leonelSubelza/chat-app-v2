package com.chatapp.core.auth.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.chatapp.core.auth.user.UserEntity;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

//Represents the filter jwt
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

//    @Autowired
//    private JwtService jwtService;
    private final JwtService jwtService;
    public JwtAuthenticationFilter(JwtService jwtService){
        this.jwtService = jwtService;
    }

    //We check if the client has a token jwt, if it has it then we validate it, if he doesn't have it then continue
    //with the next filter if exists
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            this.jwtService.startAuthentication(authorizationHeader);
            filterChain.doFilter(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
