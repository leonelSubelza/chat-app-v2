package com.chatapp.core.auth.jwt;

import com.chatapp.core.auth.user.RoleEnum;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

//Represents the bean UserDetailsService to load a user from the db
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    //we don't load the users from a db
    public static final List<UserEntity> USERS = List.of(
            UserEntity.builder()
                    .username("user")
                    //password encrypted with  1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.CLIENT)
                    .build(),
            UserEntity.builder()
                    .username("admin")
                    //password encrypted with  1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.DEVELOPER)
                    .build()
    );

    // This method execute for each request
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("se verifica que el usuario existe");
        UserEntity userLoaded = USERS.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("The user "+username+" doesn't exists in the server"));

        List<SimpleGrantedAuthority> authorityList = (List<SimpleGrantedAuthority>) userLoaded.getAuthorities();

        // We convert our UserEntity in a User object so Spring can handle it
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
