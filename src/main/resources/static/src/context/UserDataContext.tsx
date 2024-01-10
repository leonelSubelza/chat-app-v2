import type { PayloadData, UserData, UserDataContextType } from './types/types.ts';
import React, { useState,useRef,useContext, ReactNode } from 'react'
import { imageLinks } from '../services/avatarsLinks.ts';
import { generateUserId } from '../utils/IdGenerator.ts';
import { MessagesStatus } from '../components/interfaces/messages.status.ts';
import { UserChat } from '../components/interfaces/chatRoom.types.ts';
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

  const [userData, setUserData] = useState<UserData>({
    userId:'',
    username: '',
    connected: false,
    message: '',
    URLSessionid: '',
    //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
    status: MessagesStatus.JOIN,
    avatarImg: ''
  });

  const [chats, setChats] = useState<Map<UserChat, Message[]>>(new Map);
  const [tab,setTab] = useState<UserChat>();

  const resetChats = ():void => {
    let chatsAux: Map<UserChat, Message[]> = chats;
    for (var obj of chatsAux) {
      chats.delete(obj[0]);
    }
    let chatRoomObject: UserChat = {      
      id: '0',
      username: "CHATROOM",
      joinData: "-",
      avatarImg: imageLinks[0],
      hasUnreadedMessages:false
    }

    chats.set(chatRoomObject, new Array<Message>);
    setChats(new Map(chats));
    setTab(Array.from(chats.keys())[0])
  }

  const loadUserDataValues = (): void => {
    //setId
    let userId:string;
    if (localStorage.getItem('id') === null) {
      userId = generateUserId();
      localStorage.setItem('id', userId);
      userData.userId = userId;
    } else {
      userId = localStorage.getItem('id');
    }
    //setAvatarImage
    if (localStorage.getItem('avatarImg') === null) {
      localStorage.setItem('avatarImg', imageLinks[0]);
      userData.avatarImg = imageLinks[0];
    } else {
      userData.avatarImg = localStorage.getItem('avatarImg')+'';
    }
       
    if (localStorage.getItem('username') === null) {
      userData.username = '';
    } else {
      userData.username = localStorage.getItem('username')+'';
    }
    userData.userId = userId;
    setUserData({ ...userData, 
      "userId":userId, "avatarImg": userData.avatarImg, "username": userData.username });
    resetChats();
    setIsDataLoading(false);
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
        chats, setChats
      }}
    >
      {children}
    </userContext.Provider>
  )
}