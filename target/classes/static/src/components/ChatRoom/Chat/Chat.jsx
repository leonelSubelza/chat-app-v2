import React, { useContext } from 'react'
import './Chat.css';
import { userContext } from '../../../context/UserDataContext';

const Chat = ({chat,index}) => {
    const { userData,setUserData } = useContext(userContext);

    return (
        <>
            <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                <div className="message-data">{chat.message}</div>
                {chat.senderName === userData.username && <div className="avatar self"><img className="avatar-img-chat" src={userData.avatarImg}/></div>}
            </li>
        </>
    )

}
export default Chat;