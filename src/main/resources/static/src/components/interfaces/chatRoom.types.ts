export interface UserChat {
    id: string,
    username: string,
    joinDate: string,
    avatarImg: string,
    hasUnreadedMessages:boolean,
    chatRole: ChatUserRole,
    isWriting?: boolean,
    writingName?: string
}

export enum ChatUserRole {
    ADMIN = "ADMIN",
    CLIENT = "CLIENT"
}