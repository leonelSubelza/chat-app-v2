import React, { useContext, useEffect } from 'react'
import './Chat.css';
import { getHourFromUTCFormatDate } from '../../../utils/MessageDateConvertor';

const Chat = ({ chat, userData }) => {
    return (
        <>
        {(chat.status === 'MESSAGE') ?
        <li className={`message ${chat.senderId === userData.userId && "self"}`}>
            {chat.senderId !== userData.userId &&
                <div className='message-data-username'>{chat.senderName}</div>}

            <div className='message-container'>
                {chat.senderId !== userData.userId &&
                    <div className="chat-avatar">
                        <img className="avatar-img-chat" src={chat.avatarImg} />
                    </div>}
                <div className="message-data-container">
                    <div className='message-data__message-info'>
                        <p className='message-data__message-info-text'>{chat.message}</p>
                        <p className='message-data__message-info-time'>{getHourFromUTCFormatDate(chat.date)}</p>
                    </div>
                </div>
                {chat.senderId === userData.userId &&
                <div className="chat-avatar self">
                    <img className="avatar-img-chat" src={userData.avatarImg} />
                </div>}
            </div>
        </li>
        :
        <li className={'message message-connect-container'}>
            <p className='message-connect'>
                {chat.senderName }{`${chat.status === 'JOIN' ? ' joined!' : ' leaved!'}`}
            </p>
        </li>
    }
    </>
    )

}
export default Chat;