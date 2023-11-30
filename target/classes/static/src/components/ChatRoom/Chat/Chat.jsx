import React, { useContext } from 'react'
import './Chat.css';

const Chat = ({chat,userData,index}) => {

    return (
        <>
            <li className={`message ${chat.id === userData.userId && "self"}`} key={index}>
                {chat.id !== userData.userId && 
                <div className="avatar">
                    <img className="avatar-img-chat" src={userData.avatarImg}/>
                </div>}
                <div className="message-data">
                    {chat.message}
                </div>
                {chat.id === userData.userId && 
                <div className="avatar self">
                    <img className="avatar-img-chat" src={userData.avatarImg}/>
                </div>}
            </li>
        </>
    )

}
export default Chat;