import type { UserData, UserDataContextType } from './types/types.ts';
import React, { useState,useRef,useContext, ReactNode } from 'react'
import { loadAvatars } from '../services/avatarsLinks.ts';
import { generateUserId } from '../utils/IdGenerator.ts';
import { MessagesStatus } from '../components/interfaces/messages.status.ts';
import { ChatUserRole, UserChat } from '../components/interfaces/chatRoom.types.ts';
import { Message } from '../components/interfaces/messages.ts';

interface UserDataProviderProps {
  children: ReactNode;
}

/*
export const userContext = React.createContext({});

export function useUserDataContext (){
  return useContext(userContext);
}
*/
export const userContext = React.createContext<UserDataContextType>(undefined);

export function useUserDataContext (): UserDataContextType{
  return useContext(userContext);
}


export function UserDataContext({ children }: UserDataProviderProps){

  //flag que hace que se espere hasta que este componente se termine de cargar
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  //verifica que la room a la que se quiere conectar existe
  const [channelExists,setChannelExists] = useState<boolean>(false);

  //OBJ que contiene la conexion con el ws
  const stompClient = useRef<any>(null);

  const [imageLinks, setImageLinks] = useState<string[]>([]);

  const [userData, setUserData] = useState<UserData>({
    id:'',
    username: '',
    connected: false,
    message: '',
    urlSessionid: '',
    status: MessagesStatus.JOIN,
    avatarImg: '',
    chatRole: ChatUserRole.CLIENT
  });

  const [chats, setChats] = useState<Map<UserChat, Message[]>>(new Map);
  const [tab,setTab] = useState<UserChat>();
  const [bannedUsers, setBannedUsers] = useState<UserChat[]>(new Array<UserChat>);

  const resetChats = ():void => {
    let chatsAux: Map<UserChat, Message[]> = chats;
    for (var obj of chatsAux) {
      chats.delete(obj[0]);
    }
    let chatRoomObject: UserChat = {      
      id: '0',
      username: "CHATROOM",
      joinDate: "-",
      avatarImg: imageLinks[0],
      hasUnreadedMessages:false,
      chatRole: ChatUserRole.CLIENT
    }

    chats.set(chatRoomObject, new Array<Message>);
    setChats(new Map(chats));
    setTab(Array.from(chats.keys())[0])
  }

  const loadUserDataValues = (): void => {
    let imageLinksAux:string[] = loadAvatars();
    //setId
    let userId:string;
    if (localStorage.getItem('id') === null) {
      userId = generateUserId();
      localStorage.setItem('id', userId);
      userData.id = userId;
    } else {
      userId = localStorage.getItem('id');
    }
    
    //setAvatarImage
    if(localStorage.getItem('avatarImg') === 'undefined') {
      localStorage.setItem('avatarImg', imageLinksAux[0]);
      userData.avatarImg = imageLinksAux[0];
    } else {
      userData.avatarImg = localStorage.getItem('avatarImg')+'';
    }
    
    //Por alguna razón este hijo de puta si no existe da null y no undefined como avatarimg    
    if(localStorage.getItem('username') === null) {
      localStorage.setItem('username', 'Anónimo'+userId);
      userData.username = 'Anónimo'+userId;
    } else {
      userData.username = localStorage.getItem('username')+'';
    }
    userData.id = userId;
    setUserData({ ...userData, 
      "id":userId, "avatarImg": userData.avatarImg, "username": userData.username });
    resetChats();
    setIsDataLoading(false);
    setImageLinks(imageLinksAux);
  }

  return (
    <userContext.Provider
      value={{
        channelExists,setChannelExists,
        isDataLoading, setIsDataLoading,
        userData, setUserData,
        tab,setTab,
        stompClient,
        loadUserDataValues,
        resetChats,
        chats, setChats,
        bannedUsers, setBannedUsers,
        imageLinks
      }}
    >
      {children}
    </userContext.Provider>
  )
}