import React, { useContext, useState } from 'react'
import Chat from "../Chat.jsx";
import { v4 as uuidv4 } from 'uuid';
import { userContext } from '../../../../context/UserDataContext.jsx';

const ChatPrivate = () => {
    const { privateChats,tab,userData } = useContext(userContext);
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {(privateChats.size > 0 && privateChats.get(tab) !== undefined) && 
                    privateChats.get(tab).map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                            isPublicChat={false}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatPrivate;

//{(privateChats.size>0 && privateChats.get(tab)!==undefined) && [...privateChats.get(tab)].map((chat,index)=>(