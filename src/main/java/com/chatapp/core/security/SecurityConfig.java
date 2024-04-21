package com.chatapp.core.security;

import com.chatapp.core.auth.jwt.JwtAuthenticationFilter;
import com.chatapp.core.auth.jwt.JwtService;
import com.chatapp.core.auth.user.RoleEnum;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtService jwtService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable())

                //in jwt we don't save any session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(authConfig -> authConfig
                        .requestMatchers(HttpMethod.POST,"/auth/**").permitAll()
                        .anyRequest().denyAll()
                )

                .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    // Principal component which realize the authentication of the user credentials
    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

    // This AuthenticationProvider provide the valid User by using the PasswordEncoder and UserDetailsService Beans
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
//        provider.setUserDetailsService(userDetailsService());
        provider.setUserDetailsService(userDetailsService());
        return provider;
    }

    // This bean provides the type of encode for the password
    @Bean
    public PasswordEncoder passwordEncoder() {
//        PasswordEncoder no se usa mas porque no es seguro
//        return NoOpPasswordEncoder.getInstance();
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        //cada vez que se trae un usuario de la bd se lo debe manejar en un objeto UserDetails
        List<UserDetails> userDetailsList = new ArrayList<>();

        //Aquí se simula que se los obtiene de la bd
        userDetailsList.add(
                UserEntity.builder()
                        .username("user")
                        //password encrypted with  1234
                        .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                        .role(RoleEnum.CLIENT)
                        .build()
        );

        userDetailsList.add(
                UserEntity.builder()
                        .username("admin")
                        //password encrypted with  1234
                        .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                        .role(RoleEnum.DEVELOPER)
                        .build()
        );

        return new InMemoryUserDetailsManager(userDetailsList);
    }

}
