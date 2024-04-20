package com.chatapp.core.auth;

import com.chatapp.core.auth.dto.AuthLoginRequest;
import com.chatapp.core.auth.dto.AuthResponse;
import com.chatapp.core.auth.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public AuthResponse login(AuthLoginRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                request.username(),request.password()
        );

        //El metodo authenticate genera un objeto que representa la autenticacion válida del usuario
        Authentication authentication = authenticationManager.authenticate(authToken);

        //Se setea la autenticacion en la sesion de SpringSecurity actual para que pueda ser accedido desde cualquier
        //parte del codigo
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = this.jwtService.createToken(authentication);

        return new AuthResponse(request.username(), "User logged succesfully!",accessToken,true);
    }


}
