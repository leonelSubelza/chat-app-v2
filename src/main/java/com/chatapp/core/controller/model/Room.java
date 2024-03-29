package com.chatapp.core.controller.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    private String id;
    private Set<User> users = new HashSet<>();
    private Set<User> bannedUsers = new HashSet<>();

    public boolean isUserBannedFromRoom(String userId){
        return !bannedUsers.isEmpty() && bannedUsers.stream().anyMatch(user -> user.getId().equals(userId));
    }

    public boolean removeUserFromRoom(String id){
        return users.removeIf(user -> user.getId().equals(id));
    }
}
