import React, { useState } from 'react'
export const userContext = React.createContext();

export function UserDataContext({children}) {
    const [userData, setUserData] = useState({
        username: localStorage.getItem('username')===null ? '' : localStorage.getItem('username'),
        connected: false,
        receivername: '',
        message: '',
        URLSessionid:'pene',
        status:'JOIN'
      });

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