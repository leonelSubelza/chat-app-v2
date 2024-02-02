package com.chatapp.core.config;

import com.chatapp.core.controller.model.Room;
import com.chatapp.core.controller.model.User;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
public class WebSocketRoomHandler {
    public static Map<String, Room> activeRooms = new HashMap<>();

    public static void addRoom(Room room) {
        activeRooms.put(room.getId(),room);
    }

    public static void removeRoom(Room room) {
        activeRooms.remove(room.getId());
    }

    public static Room getRoom(String roomId){
        return activeRooms.get(roomId);
    }

    public static void removeRoom(String roomId){
        activeRooms.remove(roomId);
    }

    public static int getActiveRoomsCount() {
        return activeRooms.size();
    }

    public static boolean isUserInSomeRoom(String id){
        for (Room room : activeRooms.values()) {
            for(User user: room.getUsers()){
                if(user.getId().equals(id)){
                    return true;
                }
            }
        }
        return false;
        //return activeRooms.values().stream()
        //        .anyMatch(room -> room.getUsers().stream().anyMatch(user -> user.getId().equals(id)));
    }

    public static void showRoomAndUserInfo() {
        log.info("All the rooms: "+WebSocketRoomHandler.activeRooms);
        log.info("All the users: "+WebSocketSessionHandler.activeSessions);
    }
}
