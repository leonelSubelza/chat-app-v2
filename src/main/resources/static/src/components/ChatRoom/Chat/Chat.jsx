import React, { useContext, useEffect } from 'react'
import './Chat.css';
import { getHourFromUTCFormatDate } from '../../../utils/MessageDateConvertor';

const Chat = ({chat,userData}) => {
    return (
            <li className={`message ${chat.senderId === userData.userId && "self"}`}>
                {chat.senderId !== userData.userId && 
                <div className="chat-avatar">
                    <img className="avatar-img-chat" src={chat.avatarImg}/>
                </div>}
                <div className="message-data-container">
                    <p className='message-data-text'>{chat.message}</p>
                    <p className='message-data-time'>{getHourFromUTCFormatDate(chat.date)}</p>
                </div>
                {chat.senderId === userData.userId && 
                <div className="chat-avatar self">
                    <img className="avatar-img-chat" src={userData.avatarImg}/>
                </div>}
            </li>
    )

}
export default Chat;