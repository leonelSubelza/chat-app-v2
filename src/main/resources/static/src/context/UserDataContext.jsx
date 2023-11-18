import React, { useEffect, useState } from 'react'
import {imageLinks} from '../services/avatarsLinks.js';

export const userContext = React.createContext();

export function UserDataContext({children}) {
    const [userData, setUserData] = useState({
        username: '',
        connected: false,
        receivername: '',
        message: '',
        URLSessionid:'pene',
        //el estado indica luego en el chatroom qué hay que hacer, si unirse auna sala o crear una
        status:'JOIN',
        avatarImg: ''
      });

      const [messageData, setMessageData] = useState({
        receivername: '',
        message: '',
        status:'JOIN'
      })

      const loadUserDataValues = () => {
        //setAvatarImage
        let urlImg = '';
        if(localStorage.getItem('avatarImg')===null){
            localStorage.setItem('avatarImg',imageLinks[0]);
            urlImg = imageLinks[0];
        }else{
            urlImg = localStorage.getItem('avatarImg')
        }
        //setUserName
        let username='';
        if(localStorage.getItem('username')===null){
            username='';
        }else{
            username=localStorage.getItem('username');
        }
        setUserData({...userData,"avatarImg": urlImg,"username":username});

      }

      useEffect(() => {
        loadUserDataValues();  
      },[])

      return (
        <userContext.Provider
            value={{
                userData,setUserData
            }}
        >
            {children}
        </userContext.Provider>
    )
}