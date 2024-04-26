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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
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
            System.out.println("tiró excepcion el validat token");
            //si esta excepcion se lanza es porque el token no es valido
            throw new JWTVerificationException("Token invalid, not Authorized");
        }
    }

    public String extractUsername(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    public UserDetails findByUsername(String username) throws UsernameNotFoundException{
        return userDetailsService.loadUserByUsername(username);
    }

    //Authenticate a user if he has a token, also we check if the token is valid.
    // It returns an Authentication object because the ChannelInterceptor needs it.
    public Authentication startAuthentication(String authorizationHeader) {
        String token = authorizationHeader.split("Bearer ")[1];

        DecodedJWT decodedJWT = validateToken(token);
        //El token es válido
        String username = extractUsername(decodedJWT);

        UserDetails userToAuthenticate = findByUsername(username);

        SecurityContext context = SecurityContextHolder.getContext();
        //las credentials/contraseña o.O no es necesario por seguridad
        Authentication authentication = new
                UsernamePasswordAuthenticationToken(username, null, userToAuthenticate.getAuthorities());

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        return authentication;
    }
}
