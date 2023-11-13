import React, { useContext } from 'react'

const ChatGeneral = ({publicChats,handleMessage,sendValue,userData}) => {

    return (
        <div className="chat-content">
            <ul className="chat-messages">
                {publicChats.map((chat,index)=>(
                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                        {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                        <div className="message-data">{chat.message}</div>
                        {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                    </li>
                ))}
            </ul>

            <div className="send-message">
                <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                <button type="button" className="send-button" onClick={sendValue}>send</button>
            </div>
        </div>
    )

}
export default ChatGeneral;