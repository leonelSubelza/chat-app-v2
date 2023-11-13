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
    //IdRoom, User
    private Set<User> users = new HashSet<>();
    //Despues habria que tener un admin no jajajjs y le metes un Enum RoomRole {ADMIN, CLIENT}
}
