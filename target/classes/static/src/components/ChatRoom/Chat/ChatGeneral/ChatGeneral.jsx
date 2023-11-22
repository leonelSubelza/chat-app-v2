import React, { useContext } from 'react'
import Chat from "../Chat.jsx";

const ChatGeneral = ({ publicChats, handleMessage, sendValue }) => {

    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {publicChats.map((chat, index) => (
                        <Chat
                            chat={chat}
                            index={index}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatGeneral;