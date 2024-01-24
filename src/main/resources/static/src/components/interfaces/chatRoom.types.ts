export interface UserChat {
    id: string,
    username: string,
    joinData: string,
    avatarImg: string,
    hasUnreadedMessages:boolean,
    chatRole: ChatUserRole
}

export enum ChatUserRole {
    ADMIN = "ADMIN",
    CLIENT = "CLIENT"
}