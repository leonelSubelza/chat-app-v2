import React, { useEffect, useState,useRef,useContext } from 'react'
import { imageLinks } from '../services/avatarsLinks.js';
import { generateUserId } from '../utils/IdGenerator.js';

export const userContext = React.createContext();

export function useUserDataContext (){
  return useContext(userContext);
}

export function UserDataContext({ children }) {

  //flag que hace que se espere hasta que este componente se termine de cargar
  const [isDataLoading, setIsDataLoading] = useState(true);

  //flag para que no ejecute el método connect() más de una vez
  const startedConnection = useRef(false);

  //verifica que la room a la que se quiere conectar existe
  const [channelExists,setChannelExists] = useState(false);

  //OBJ que contiene la conexion con el ws
  const stompClient = useRef(null);

  const [userData, setUserData] = useState({
    userId:'',
    username: '',
    connected: false,
    receivername: '',
    message: '',
    URLSessionid: '',
    //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
    status: 'JOIN',
    avatarImg: ''
  });

  const [privateChats, setPrivateChats] = useState(new Map());     
  const [publicChats, setPublicChats] = useState([]); 
  const [tab,setTab] =useState("CHATROOM");

  const [messageData, setMessageData] = useState({
    receivername: '',
    message: '',
    status: 'JOIN'
  })

  const loadUserDataValues = () => {
    //setAvatarImage
    let urlImg = '';
    if (localStorage.getItem('avatarImg') === null) {
      localStorage.setItem('avatarImg', imageLinks[0]);
      urlImg = imageLinks[0];
    } else {
      urlImg = localStorage.getItem('avatarImg')
    }
    //setUserName
    let username = '';
    if (localStorage.getItem('username') === null) {
      username = '';
    } else {
      username = localStorage.getItem('username');
    }
    //localStorage.setItem('connected', false);
    let idGeneradooo = generateUserId();
    setUserData({ ...userData, "userId":idGeneradooo, "avatarImg": urlImg, "username": username });
    console.log("idGenrado para el usuario mio o sea yo: "+idGeneradooo);
    setIsDataLoading(false);
  }

  useEffect(() => {
    loadUserDataValues();
  }, [])

  return (
    <userContext.Provider
      value={{
        startedConnection,
        channelExists,setChannelExists,
        isDataLoading, setIsDataLoading,
        userData, setUserData,
        privateChats, setPrivateChats,
        publicChats, setPublicChats,
        messageData, setMessageData,
        tab,setTab,
        stompClient
      }}
    >
      {children}
    </userContext.Provider>
  )
}