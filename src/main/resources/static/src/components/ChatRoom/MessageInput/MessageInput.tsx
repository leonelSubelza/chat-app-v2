import React, { useContext, useRef, useState } from "react";
import "./MessageInput.css";
import { userContext } from "../../../context/UserDataContext";
import { maxMessageLength } from "../../../config/chatConfiguration";

interface Props {
  onSend: () => void;
  handleWritingNotification: (isWriting: boolean) => void;
}

const MessageInput = ({ onSend, handleWritingNotification }: Props) => {
  const { userData, setUserData } = useContext(userContext);

  const typingTimer = useRef<NodeJS.Timeout>();
  const isWritingMsjSended = useRef<boolean>(false);

  const handleMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if(value.length>maxMessageLength){
      console.log("la cant de caracteres es mayor a 255");
      return;
    }
    setUserData({ ...userData, message: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let key: string;
    if (typeof e !== "string") {
      key = e.key;
    }
    if(key.toString()==="Unidentified"){
        //Esto porque en mobile el e.key no lo tomaba. Acá toma todo el txt escrito
        key=e.currentTarget.value;
    }
    clearTimeout(typingTimer.current);
    if (/^[a-zA-Z\d]$|^Backspace$|^Delete$/.test(key)) {
      if (!isWritingMsjSended.current) {
        console.log("Se envia msj escribiendo");
        isWritingMsjSended.current = true;
        return handleWritingNotification(true);
      }
    }
  };

  const handleKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if(isWritingMsjSended.current){
        console.log("Se envia msj terminó de escribir");
        isWritingMsjSended.current = false;
        return handleWritingNotification(false);
      }
    }, 1000);
  };

  return (
    <div className="send-message">
      <input
        type="text"
        className="input-message"
        placeholder="Write a message..."
        value={userData.message}
        onChange={handleMessage}
        autoFocus
        onKeyDown={(e) => handleKeyDown(e)}
        onKeyUp={(e) => handleKeyPressed(e)}
      />
      <button type="button" className="send-button" onClick={() => onSend()}>
        <p className="send-button-type1">Send</p>
        <p className="send-button-type2">
          <i className="bi bi-send-fill"></i>
        </p>
      </button>
    </div>
  );
};

export default MessageInput;
