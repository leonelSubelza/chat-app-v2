import React from 'react';

const MessageInput = ({ value, onChange, onSend }) => {
    return (
        <div className="send-message">
            <input
                type="text"
                className="input-message"
                placeholder="enter the message"
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