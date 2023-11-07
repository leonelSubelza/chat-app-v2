package com.chatapp.core.config;


import com.chatapp.core.controller.model.User;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class WebSocketSessionHandler {

    //debería ser un map con id,nombreUsuario
    private static final Set<User> activeSessions = new HashSet<>();

    public static void addSession(User user) {
        activeSessions.add(user);
    }

    public static void removeSession(User user) {
        activeSessions.remove(user);
    }

    public static void removeSession(String username){
        activeSessions.removeIf(user -> user.getUsername().equals(username));
    }

    public static int getActiveSessionsCount() {
        return activeSessions.size();
    }

    public static User getUser(String username){
        Optional<User> user = activeSessions.stream().filter(u -> u.getUsername().equals(username)).findFirst();
        return user.orElse(null);
    }
}
