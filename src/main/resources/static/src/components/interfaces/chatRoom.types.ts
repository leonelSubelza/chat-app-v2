export interface UserChat {
    id: string,
    username: string,
    joinData: string,
    avatarImg: string,
    hasUnreadedMessages:boolean,
    chatRole: ChatRole
}

export enum ChatRole {
    ADMIN = "ADMIN",
    CLIENT = "CLIENT"
}