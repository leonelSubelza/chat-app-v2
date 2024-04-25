package com.chatapp.core.config;


import com.chatapp.core.model.User;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public class WebSocketSessionHandler {

    //Este map lo manejamos para tener una lista con todos los usuarios conectados y saber cuántos son
    public static final Set<User> activeSessions = new HashSet<>();

    public static void addSession(User user) {
        activeSessions.add(user);
    }

    public static void removeSession(User user) {
        activeSessions.remove(user);
    }

    public static boolean removeSessionById(String id){
        return activeSessions.removeIf(user -> user.getId().equals(id));
    }

    public static int getActiveSessionsCount() {
        return activeSessions.size();
    }

    public static User getUser(String id){
        Optional<User> user = activeSessions.stream().filter(u -> u.getId().equals(id)).findFirst();
        return user.orElse(null);
    }

    public static boolean existsUser(String id){
        /*return WebSocketSessionHandler.activeSessions.stream().filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);*/
        return activeSessions.stream().anyMatch(user -> user.getId().equals(id));
    }

}
