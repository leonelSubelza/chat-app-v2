import React, { useContext } from 'react'
import Chat from "../Chat.jsx";
import { userContext } from '../../../../context/UserDataContext.jsx';
import { v4 as uuidv4 } from 'uuid';

const ChatGeneral = ({ publicChats }) => {
    const { userData } = useContext(userContext);
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {publicChats.map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatGeneral;