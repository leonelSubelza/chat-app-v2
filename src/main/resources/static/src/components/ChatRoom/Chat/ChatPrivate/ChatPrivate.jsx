import React, { useContext, useState } from 'react'
import Chat from "../Chat.jsx";
import { v4 as uuidv4 } from 'uuid';

const ChatPrivate = ({ privateChats, tab, sendPrivateValue, userData, handleMessage }) => {
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {(privateChats.size > 0 && privateChats.get(tab) !== undefined) && privateChats.get(tab).map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatPrivate;

//{(privateChats.size>0 && privateChats.get(tab)!==undefined) && [...privateChats.get(tab)].map((chat,index)=>(