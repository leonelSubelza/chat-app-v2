// export const serverURL: string = "http:/localhost:8080/ws";
export const serverURL: string = "http://192.168.1.3:8080/ws";


// export const baseServerURL: string = "http://localhost:8080";
export const baseServerURL: string = "http://192.168.1.3:8080";

// export const serverURL: string = "http://192.168.1.2:8080/ws";
// export const serverURL: string = "https://chat-app-v2-q999.onrender.com/ws";

export const webSiteBaseURL: string = "/chat-app-v2/"
export const webSiteChatURL: string = "/chat-app-v2/chatroom/"
export const maxMessageLength: number = 255;
export const maxUsernameLength: number = 255

//1 min
export const tokenExpirationTimeByMinute = 1;

export enum ChatPaths {
    CHECK_CHANNEL = "/app/check-channel",
    USER_DISCONNECTED = "/app/user.disconnected",
    CHAT_JOIN = "/app/chat.join",
    PRIVATE_MESSAGE = "/app/private-message",
    PUBLIC_MESSAGE = "/app/group-message"
}