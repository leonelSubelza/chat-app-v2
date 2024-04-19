package com.chatapp.core.auth;

import com.chatapp.core.auth.user.RoleEnum;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class UserDetailsServiceImpl implements UserDetailsService {


    //we don't load the users from a db
    private static final List<UserEntity> USERS = List.of(
            UserEntity.builder()
                    .username("user")
                    //password encriptado con 1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.CLIENT)
                    .build(),
            UserEntity.builder()
                    .username("admin")
                    //password encriptado con 1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.DEVELOPER)
                    .build()
    );

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity userLoaded = USERS.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("The user "+username+" doesn't exists in the server"));

        List<SimpleGrantedAuthority> authorityList = (List<SimpleGrantedAuthority>) userLoaded.getAuthorities();

        //Convertimos nuestro UserEntity en un objeto User que entiende Spring security
        return new User(
                userLoaded.getUsername(),
                userLoaded.getPassword(),
                userLoaded.isEnabled(),
                userLoaded.isAccountNonExpired(),
                userLoaded.isCredentialsNonExpired(),
                userLoaded.isAccountNonLocked(),
                authorityList
        );
    }
}
