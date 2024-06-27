package com.chatapp.core.auth.jwt;

import com.chatapp.core.auth.user.RoleEnum;
import com.chatapp.core.auth.user.UserEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Arrays;
import java.util.List;

//public class UserDetailsServiceImpl implements UserDetailsService {
public class UserDetailsServiceImpl{

/*    private static final List<UserDetails> USERS = Arrays.asList(
          UserEntity.builder()
                    .username("user")
                    //password encrypted with  1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.CLIENT)
                    .build()
            ,
            UserEntity.builder()
                    .username("admin")
                    //password encrypted with  1234
                    .password("$2a$10$GKOgBE3i4xtIY6jfwu2uReuiqbsaz.g8y0rTVvtt.NJHf.rzeGvtC")
                    .role(RoleEnum.DEVELOPER)
                    .build()
        );

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDetails userLoaded = USERS.stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst()
                .orElseThrow(
                        () -> new UsernameNotFoundException("The user "+username+" doesn't exists")
                );

        return new User(
                userLoaded.getUsername(),
                userLoaded.getPassword(),
                userLoaded.isEnabled(),
                userLoaded.isAccountNonExpired(),
                userLoaded.isCredentialsNonExpired(),
                userLoaded.isAccountNonLocked(),
                userLoaded.getAuthorities()
        );
    }*/
}
