import React, { useContext, useRef, useState } from 'react';
import './MessageInput.css'
import { userContext } from '../../../context/UserDataContext';

interface Props {
    onSend: ()=>void;
    handleWritingNotification: (isWriting: boolean)=>void
}

const MessageInput = ({ onSend,handleWritingNotification }: Props) => {
    const { userData, setUserData} = useContext(userContext);

    const typingTimer = useRef<NodeJS.Timeout>();
    const [isWritingMsjSended, setIsWritingMsjSended] = useState<boolean>(false);

    const handleMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let key: React.KeyboardEvent<HTMLInputElement> | string = e;
        if (typeof e !== "string") {
          key = e.key;
        }
        clearTimeout(typingTimer.current);
        if (/^[a-zA-Z\d]$/.test(key.toString())) {
          if (!isWritingMsjSended) {
            console.log("Se envia msj escribiendo");
            //Enviar msj de que se terminó de escribir
            setIsWritingMsjSended(true);
            return handleWritingNotification(true);
          }
        }
    }

    const handleKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            console.log("Se envia msj terminó de escribir");
            setIsWritingMsjSended(false);
            return handleWritingNotification(false)
        }, 1000);

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
                onKeyDown={(e)=>handleKeyDown(e)}
                onKeyUp={(e)=>handleKeyPressed(e)}
            />
            <button type="button" className="send-button" onClick={()=> onSend()}>
                <p className='send-button-type1'>Send</p>
                <p className='send-button-type2'><i className="bi bi-send-fill"></i></p>
            </button>
        </div>
    );
};

export default MessageInput;