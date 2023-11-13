import React, { useContext } from 'react'

const Chat = ({userData,chat,index}) => {

    return (
        <>
            <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                <div className="message-data">{chat.message}</div>
                {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
            </li>
        </>
    )

}
export default Chat;