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
        status:'JOIN',
        avatarImg: ''
      });

      const loadUserDataValues = () => {
        //setAvatarImage
        let urlImg = '';
        if(localStorage.getItem('avatarImg')===null || localStorage.getItem('avatarImg')==='undefined'){
            localStorage.setItem('avatarImg',imageLinks[0]);
            urlImg = imageLinks[0];
        }else{
            urlImg = localStorage.getItem('avatarImg')
        }
        //setUserName
        let username='';
        if(localStorage.getItem('username')=='undefined' || localStorage.getItem('username')===null
        ||localStorage.getItem('username')===undefined){
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