import React, { useContext } from 'react';
import './MessageInput.css'
import { userContext } from '../../../context/UserDataContext';

interface Props {
    onSend: ()=>void;
}

const MessageInput = ({ onSend }: Props) => {
    const { userData, setUserData} = useContext(userContext);

    const handleMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
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