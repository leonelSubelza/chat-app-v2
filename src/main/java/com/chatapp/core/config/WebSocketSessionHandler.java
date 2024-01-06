package com.chatapp.core.config;


import com.chatapp.core.controller.model.User;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class WebSocketSessionHandler {

    //Este map lo manejamos para tener una lista con todos los usuarios conectados y saber cuántos son
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

    public static User getUser(String id){
        Optional<User> user = activeSessions.stream().filter(u -> u.getId().equals(id)).findFirst();
        return user.orElse(null);
    }

    public static User existsUser(String id){
        return WebSocketSessionHandler.activeSessions.stream().filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}
