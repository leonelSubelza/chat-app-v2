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

}
