import React from 'react';
import './MessageInput.css'
const MessageInput = ({ value, onChange, onSend }) => {
    return (
        <div className="send-message">
            <input
                type="text"
                className="input-message"
                placeholder="Message..."
                value={value}
                onChange={onChange}
            />
            <button type="button" className="send-button" onClick={onSend}>
                Send
            </button>
        </div>
    );
};

export default MessageInput;