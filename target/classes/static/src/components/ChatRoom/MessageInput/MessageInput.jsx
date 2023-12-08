import React, { useContext } from 'react';
import './MessageInput.css'
import { userContext } from '../../../context/UserDataContext';

const MessageInput = ({ onSend }) => {
    const { userData, setUserData} = useContext(userContext);

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
/*
    const handleKeyPressedMsg = (e) => {
        console.log("se escucha keypressed en chatroom");
        let key = e;
        if (typeof e !== 'string') {
            key = e.key;
        }
        if(key === 'Enter'){
            return onSend();
        }

        const { value } = e.target;
        setUserData({ ...userData, "message": value });
    }

*/
    return (
        <div className="send-message">
            <input
                type="text"
                className="input-message"
                placeholder="Write a message..."
                value={userData.message}
                onChange={handleMessage}
                autoFocus
            />
            <button type="button" className="send-button" onClick={()=> onSend()}>
                <i className="bi bi-send-fill"></i>
            </button>
        </div>
    );
};

export default MessageInput;