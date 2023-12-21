import React, { useEffect, useState,useRef,useContext } from 'react'
import { imageLinks } from '../services/avatarsLinks.js';
import { generateUserId } from '../utils/IdGenerator.js';
import chatRoomIcon from '../assets/people-icon.svg';
export const userContext = React.createContext();

export function useUserDataContext (){
  return useContext(userContext);
}

export function UserDataContext({ children }) {

  //flag que hace que se espere hasta que este componente se termine de cargar
  const [isDataLoading, setIsDataLoading] = useState(true);

  //verifica que la room a la que se quiere conectar existe
  const [channelExists,setChannelExists] = useState(false);

  //OBJ que contiene la conexion con el ws
  const stompClient = useRef(null);

  const [userData, setUserData] = useState({
    userId:'',
    username: '',
    connected: false,
    receivername: '',//este tal vez borrar
    message: '',
    URLSessionid: '',
    //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
    status: 'JOIN',
    avatarImg: ''
  });

  const [privateChats, setPrivateChats] = useState(new Map());     
  const [publicChats, setPublicChats] = useState([]); 
  const [chats, setChats] = useState(new Map());
  const [tab,setTab] =useState();//tab es o 'CHATROOM' o un obj chatUser

  //este no se usa tal vez borrar
  const [messageData, setMessageData] = useState({
    receivername: '',
    message: '',
    status: 'JOIN'
  })

  const loadUserDataValues = () => {
    //setAvatarImage
    if (localStorage.getItem('avatarImg') === null) {
      localStorage.setItem('avatarImg', imageLinks[0]);
      userData.avatarImg = imageLinks[0];
    } else {
      userData.avatarImg = localStorage.getItem('avatarImg')
    }
       
    if (localStorage.getItem('username') === null) {
      userData.username = '';
    } else {
      userData.username = localStorage.getItem('username');
    }
    //localStorage.setItem('connected', false);
    userData.userId = generateUserId();
    setUserData({ ...userData, "userId":userData.userId, "avatarImg": userData.avatarImg, "username": userData.username });
    setIsDataLoading(false);

    resetChats();
  }

  const resetChats = () => {
    let chatsAux = chats;
    for (var obj of chatsAux) {
      chats.delete(obj[0]);
    }
    let chatRoomObject = {
      id: 0,
      username: "CHATROOM",
      joinData: "-",
      avatarImg: chatRoomIcon,
      hasUnreadedMessages:false
    }

    chats.set(chatRoomObject, []);
    setChats(new Map(chats));
    setTab(Array.from(chats.keys())[0])
  }

  return (
    <userContext.Provider
      value={{
        channelExists,setChannelExists,
        isDataLoading, setIsDataLoading,
        userData, setUserData,
        privateChats, setPrivateChats,
        publicChats, setPublicChats,
        messageData, setMessageData,
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