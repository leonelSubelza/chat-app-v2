package com.chatapp.core.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable())

                //in jwt we don't save any session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }


    /*
    //Se crean los usuarios válidos acá y no se traen de la bd
    //Se obtiene un usuario válido para autenticarse
    @Bean
    public UserDetailsService userDetailsService() {
        //cada vez que se trae un usuario de la bd se lo debe manejar en un objeto UserDetails
        List<UserDetails> userDetailsList = new ArrayList<>();

        //Aquí se simula que se los obtiene de la bd
        userDetailsList.add(User
                .withUsername("user")
                .password("user")
                .roles("ADMIN")
                .authorities("READ","CREATE")
                .build()
        );

        userDetailsList.add(User
                .withUsername("pepe")
                .password("pepe")
                .roles("USER")
                .authorities("READ")
                .build()
        );

//        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
//        manager.createUser(User
//                .withUsername("user")
//                .password("user")
//                .roles()
//                .build()
//        );
//        return manager;
        return new InMemoryUserDetailsManager(userDetailsList);
    }
    */
}
