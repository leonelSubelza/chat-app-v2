package com.chatapp.core.auth.jwt;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.chatapp.core.exceptions.ErrorDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;

//Represents the filter jwt
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

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

        try{
            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                this.jwtService.startAuthentication(authorizationHeader);
                filterChain.doFilter(request, response);
                return;
            }
            filterChain.doFilter(request, response);
        }catch (JWTVerificationException e){
            //The errors during the auth cannot be caught by the controllerAdvice, it must be caught here
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            ErrorDetails errorDetails = ErrorDetails
                        .builder()
                        .timestamp(new Date())
                        .message(e.getMessage())
                        .statusCode(HttpStatus.FORBIDDEN.value())
                        .build();
            new ObjectMapper().writeValue(response.getWriter(), errorDetails);
        }
    }
}
