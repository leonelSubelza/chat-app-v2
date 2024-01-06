import React, { useContext } from 'react';
import './MessageInput.css'
import { userContext } from '../../../context/UserDataContext';

const MessageInput = ({ onSend }) => {
    const { userData, setUserData} = useContext(userContext);

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    
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
                <p className='send-button-type1'>Send</p>
                <p className='send-button-type2'><i className="bi bi-send-fill"></i></p>
            </button>
        </div>
    );
};

export default MessageInput;