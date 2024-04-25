package com.chatapp.core.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${jwt.secret.key}")
    private String PRIVATE_KEY;

    @Value("${jwt.user.generator}")
    private String USER_GENERATOR;

    @Value("${jwt.time.expiration}")
    private long TOKEN_EXPIRATION;


//    @Autowired
//    private UserDetailsService userDetailsService;
    private final UserDetailsService userDetailsService;
    public JwtService(@Lazy UserDetailsService userDetailsService){
        this.userDetailsService=userDetailsService;
    }


    public String createToken(Authentication authentication) {
        Algorithm algorithm = Algorithm.HMAC256(this.PRIVATE_KEY);
//        String username = authentication.getPrincipal().toString();
//        System.out.println("se crea el token con este sub: "+username);

        UserDetails userLoaded = (UserDetails) authentication.getPrincipal();
        String username = userLoaded.getUsername();

        //CREATE, DELETE, ...
        String authorities = authentication.getAuthorities()
                .stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.joining(",")); //Transforma la lista en un String separando por comas los obj

        return JWT.create()
                .withIssuer(this.USER_GENERATOR)
                .withSubject(username)
                //le generamos un claim llamado "authorities" con las authorities de la authentication
                .withClaim("authorities",authorities)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + TOKEN_EXPIRATION))
                .withJWTId(UUID.randomUUID().toString())
                //desde cuando se va a considerar válido este token - desde este momento xd
                .withNotBefore(new Date(System.currentTimeMillis()))
                .sign(algorithm);
    }

    public DecodedJWT validateToken(String token){
        try{
            Algorithm algorithm = Algorithm.HMAC256(this.PRIVATE_KEY);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(this.USER_GENERATOR)
                    .build();

            return verifier.verify(token);
        }catch (JWTVerificationException e) {
            //si esta excepcion se lanza es porque el token no es valido
            throw new JWTVerificationException("Token invalid, not Authorized");
        }
    }

    public String extractUsername(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    public UserEntity findByUsername(String username) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (userDetails instanceof UserEntity) {
            return (UserEntity) userDetails;
        }
        throw new UsernameNotFoundException("El usuario no fue encontrado o no es de tipo UserEntity");
    }
}
