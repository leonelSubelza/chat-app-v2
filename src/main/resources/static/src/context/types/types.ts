import { UserChat } from "../../components/interfaces/chatRoom.types";
import { Message } from "../../components/interfaces/messages";
import { MessagesStatus } from "../../components/interfaces/messages.status";

export type UserData = {
    userId: string,
    username: string,
    connected: boolean,
    message: string,
    URLSessionid: string,
    //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
    status: MessagesStatus,
    avatarImg: string,
  }

export type UserDataContextType = {
    channelExists: boolean,setChannelExists: (value: boolean)=> void,
    isDataLoading: boolean, setIsDataLoading: (value: boolean)=> void,
    userData: UserData, setUserData: (value: UserData)=> void,
    tab: UserChat,setTab: (value: UserChat)=> void,
    stompClient:any,
    loadUserDataValues: ()=>void,
    resetChats: ()=>void,
    chats:Map<UserChat,Message[]>, setChats:(value: Map<UserChat,Message[]>)=> void
}

export type ChatRoomConnectionContextType = {
    disconnectChat: ()=>void,
    checkIfChannelExists: ()=>void,
    startServerConnection: ()=>void,
    startedConnection: React.MutableRefObject<boolean>,
    chatUserTyping: ChatUserTypingType
}


export type ChatUserTypingType = {
    isChatUserTyping: boolean,
    chatUser?: UserChat|null,
    isPublicMessage?: boolean
}
export type MessageUserTyping = {
    received:boolean,
    receivedInPublicMessage:boolean,
    payloadData:Message|null
}