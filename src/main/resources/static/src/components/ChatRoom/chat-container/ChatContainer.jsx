import React, { useContext, } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { userContext } from '../../../context/UserDataContext.tsx';
import './ChatContainer.css';
import Message from './message/Message.jsx';

const ChatContainer = () => {
    const { userData,chats,tab } = useContext(userContext);
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {(chats.size > 0 && chats.get(tab) !== undefined) && 
                    chats.get(tab).map((message) => (
                        <Message
                            key={uuidv4()}
                            message={message}
                            userData={userData}
                            isPublicChat={message.username==='CHATROOM'}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}
export default ChatContainer;