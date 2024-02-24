import { UserChat, ChatUserRole } from "../../components/interfaces/chatRoom.types";
import { Message } from "../../components/interfaces/messages";
import { MessagesStatus } from "../../components/interfaces/messages.status";

export type UserData = {
    id: string,
    username: string,
    connected: boolean,
    message: string,
    urlSessionid: string,
    //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
    status: MessagesStatus,
    avatarImg: string,
    chatRole: ChatUserRole;
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
    bannedUsers:UserChat[], setBannedUsers:(value: UserChat[])=> void
    imageLinks: string[]
}

export type ChatRoomConnectionContextType = {
    disconnectChat: (notifyOthers: boolean)=>void,
    checkIfChannelExists: ()=>void,
    startServerConnection: ()=>void,
    startedConnection: React.MutableRefObject<boolean>,
    lostConnection: React.MutableRefObject<boolean>,
}
