import React, { useContext, useEffect } from 'react'
import Chat from "../Chat.jsx";
import { userContext } from '../../../../context/UserDataContext.jsx';
import { v4 as uuidv4 } from 'uuid';

const ChatGeneral = () => {
    const { userData,chats,tab } = useContext(userContext);
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {(chats.size > 0 && chats.get(tab) !== undefined) && 
                    chats.get(tab).map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                            isPublicChat={chat.username==='CHATROOM'}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatGeneral;
/*
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {publicChats.map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                            isPublicChat={true}
                        />
                    ))}
                </ul>
            </div>
        </div>
*/