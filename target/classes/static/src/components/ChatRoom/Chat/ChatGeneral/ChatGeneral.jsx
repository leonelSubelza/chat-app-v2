import React, { useContext } from 'react'
import Chat from "../Chat.jsx";
import { userContext } from '../../../../context/UserDataContext.jsx';

const ChatGeneral = ({ publicChats, handleMessage, sendValue }) => {
    const { userData,setUserData } = useContext(userContext);
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {publicChats.map((chat, index) => (
                        <Chat
                            chat={chat}
                            userData={userData}
                            index={index}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatGeneral;