import React, { useContext } from 'react'
import Chat from "../Chat.jsx";

const ChatGeneral = ({publicChats,handleMessage,sendValue,userData}) => {

    return (
        <div className="chat-content">
            <ul className="chat-messages">
                {publicChats.map((chat,index)=>(
                    <Chat
                        chat={chat}
                        userData={userData}
                        index={index}
                    />
                ))}
            </ul>
            
        </div>
    )

}
export default ChatGeneral;