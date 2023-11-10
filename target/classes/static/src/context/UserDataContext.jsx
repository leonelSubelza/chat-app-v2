import React, { useState } from 'react'
export const userContext = React.createContext();

export function UserDataContext({children}) {
    const [userData, setUserData] = useState({
        username: '',
        connected: false,
        message: ''
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