import React, { useContext } from 'react'
import Chat from "../Chat.jsx";

const ChatPrivate = ({privateChats,tab,sendPrivateValue,userData,handleMessage}) => {

    return (
        <div className="chat-content">
            <ul className="chat-messages">
                {(privateChats.size>0 && privateChats.get(tab)!==undefined) && [...privateChats.get(tab)].map((chat,index)=>(
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
export default ChatPrivate;