import React, { useContext, useEffect } from 'react'
import './Chat.css';

const Chat = ({chat,userData}) => {
    return (
            <li className={`message ${chat.senderId === userData.userId && "self"}`}>
                {chat.senderId !== userData.userId && 
                <div className="chat-avatar">
                    <img className="avatar-img-chat" src={chat.avatarImg}/>
                </div>}
                <div className="message-data">
                    {chat.message}
                </div>
                {chat.senderId === userData.userId && 
                <div className="chat-avatar self">
                    <img className="avatar-img-chat" src={userData.avatarImg}/>
                </div>}
            </li>
    )

}
export default Chat;