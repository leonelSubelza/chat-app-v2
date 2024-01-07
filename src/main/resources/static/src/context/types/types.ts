import { UserChat } from "../../components/interfaces/chatRoom.types";
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
    loadUserDataValues:void,
    resetChats:void,
    chats:Map<UserChat,[]>, setChats:(value: Map<UserChat,[]>)=> void
}