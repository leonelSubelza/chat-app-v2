import React, { useEffect, useState } from 'react'
import {imageLinks} from '../services/avatarsLinks.js';

export const userContext = React.createContext();

export function UserDataContext({children}) {
    const [userData, setUserData] = useState({
        username: localStorage.getItem('username')=='undefined'
                    ? '' 
                    : localStorage.getItem('username'),
        connected: false,
        receivername: '',
        message: '',
        URLSessionid:'pene',
        status:'JOIN',
        avatarImg: ''
      });

      const setAvatarImage = () => {
        if(localStorage.getItem('avatarImg')===null){
            localStorage.setItem('avatarImg',imageLinks[0]);
            return imageLinks[0];
        }else{
            return localStorage.getItem('avatarImg')
        }
      }

      useEffect(() => {
        setAvatarImage();  
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