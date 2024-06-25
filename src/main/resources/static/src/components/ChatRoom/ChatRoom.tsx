import React, { useState, useEffect, useContext, useRef } from "react";
import { Navigate, NavigateFunction, useNavigate } from "react-router-dom";
import "./ChatRoom.css";
import { userContext } from "../../context/UserDataContext";
import { chatRoomConnectionContext } from "../../context/ChatRoomConnectionContext";
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";
import { getRoomIdFromURL } from "../../utils/InputFunctions.js";
import { createPrivateMessage, createPublicMessage } from "./ChatRoomFunctions";
import ChatContainer from "./chat-container/ChatContainer.jsx";
import { MessagesStatus } from "../interfaces/messages.status";
import { Message } from "../interfaces/messages";
import {UserDataSaveLocalStorage} from "../../context/types/types.ts";
import {saveUserDataStorage} from "../../utils/localStorageFunctions.ts";
import {ChatPaths} from "../../config/chatConfiguration.ts";

const ChatRoom: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  const {
    isDataLoading,
    userData,
    setUserData,
    tab,
    setTab,
    stompClient,
    channelExists,
    chats,
    setChats,
  } = useContext(userContext);

  const { startedConnection,sendMessage } = useContext(chatRoomConnectionContext);

  const { disconnectChat, checkIfChannelExists } = useContext(
    chatRoomConnectionContext
  );

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [writingMessage, setWritingMessage] = useState<string>();

  const connect = (): void => {
    if (stompClient.current === null) {
      return;
    }
    if (!startedConnection.current || isDataLoading || !userData.connected) {
      return;
    }

    if ( userData.username === "") {
      let username: string = prompt("Ingrese un nombre de usuario");
      if (username === null) {
        alert("El nombre no puede ser vacío");
        disconnectChat(false);
        navigate("/");
        return;
      }
      saveUserDataStorage('username',username);
      setUserData({ ...userData, username: username });
      return;
    }
    //Caso en el que se conecta copiando la url, no se tiene cargado e idRoom, entonces se carga
    if (userData.urlSessionid === "") {
      const url: string = window.location + "";
      let urlSessionIdAux: string = getRoomIdFromURL(url);
      if (urlSessionIdAux === undefined) {
        disconnectChat(false);
        navigate("/");
        return;
      }
      userData.urlSessionid = urlSessionIdAux;
      setUserData({ ...userData, urlSessionid: urlSessionIdAux });
      if (stompClient.current !== null) {
        checkIfChannelExists();
      }
      return;
    }
  };

    //Send a public message  
  const sendValue = (status: MessagesStatus = MessagesStatus.MESSAGE): void => {
    if (userData.message.trim() === "" && status===MessagesStatus.MESSAGE) {
      return;
    }
    if (stompClient.current) {
      let chatMessage: Message = createPublicMessage(status, userData);
      sendMessage(chatMessage,ChatPaths.PUBLIC_MESSAGE)
      if (status === MessagesStatus.MESSAGE) {
        setUserData({ ...userData, message: "" });
      }
    }
  };

  const sendPrivateValue = (
    status: MessagesStatus = MessagesStatus.MESSAGE
  ) => {
    if (userData.message.trim() === "" && status===MessagesStatus.MESSAGE) {
      return;
    }
    if (stompClient.current) {
      let chatMessage: Message = createPrivateMessage(
        status,
        userData,
        tab.username,
        tab.id
      );
      //si se envia un msj a alguien que no sea yo mismo
      if (userData.id !== tab.id) {
        chats.get(tab).push(chatMessage);
        setChats(new Map(chats));
        // scrollToBottom();
      }
      sendMessage(chatMessage,ChatPaths.PRIVATE_MESSAGE);
      if (status === MessagesStatus.MESSAGE) {
        setUserData({ ...userData, message: "" });
        const chatContainer = document.querySelector(".scroll-messages");
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  const sendWritingNotification = (isWriting: boolean): void => {
    if (tab.username === "CHATROOM") {
      sendValue(isWriting ? MessagesStatus.WRITING : MessagesStatus.STOP_WRITING);
    } else {
      sendPrivateValue(isWriting ? MessagesStatus.WRITING : MessagesStatus.STOP_WRITING);
    }
  };

  const handleDisconnectChat = (): void => {
    disconnectChat(true);
    navigate("/");
  };

  const handleKeyPressedMsg = (e: KeyboardEvent): void => {
    e.preventDefault();
    let key: KeyboardEvent | string = e;
    if (typeof e !== "string") {
      key = e.key;
    }
    if (key === "Enter") {
      if (tab.username === "CHATROOM") {
        sendValue();
      } else {
        sendPrivateValue();
      }
      return;
    }
  };

  useEffect(() => {
    if(tab === undefined) return;
    let userChatWriting = Array.from(chats.keys()).find(u => u.id === tab.id);
    if(userChatWriting===undefined) return;
    if (userChatWriting.isWriting) {
        if(userChatWriting.username === 'CHATROOM'){
            setWritingMessage(userChatWriting.writingName+" is writing...")
        }else{
            setWritingMessage("Typing...")
        }
    }else{
        setWritingMessage("")
    }
  }, [chats,tab]);


  useEffect(() => {
    connect();
    let chatRoomElement = Array.from(chats.keys())[0];
    if (chatRoomElement === undefined) {
      return;
    }
    if (tab !== chatRoomElement && chats.get(tab) === undefined) {
      //se setea tab chatroom por defecto
      setTab(chatRoomElement);
      Array.from(chats.keys())[0].hasUnreadedMessages = false;
      setChats(new Map(chats));
    }
    if (tab === undefined) {
      setTab(chatRoomElement);
      Array.from(chats.keys())[0].hasUnreadedMessages = false;
      setChats(new Map(chats));
    }
    if (userData.connected) {
      window.addEventListener("keyup", handleKeyPressedMsg);
    }
    return () => {
      window.removeEventListener("keyup", handleKeyPressedMsg);
    };
  });
  return (
    <>
      {/* <Navigate to={`/chat-app-v2/chatroom/${userData.urlSessionid}`} /> */}
      {channelExists && startedConnection.current && !isDataLoading && (
        <div className="chatRoom-global">
          <Sidebar
            sidebarOpen={sidebarOpen}
            disconnectChat={handleDisconnectChat}
            handleSideBarOpen={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className={`chat-box ${sidebarOpen && 'active'}`}>
            <div className="home-content">
              <span className="text">{`${
                tab.username === "CHATROOM" ? "CHAT GENERAL" : tab.username
              }`}</span>
              <span className={`user_writing`}>{writingMessage}</span>
            </div>
            <ChatContainer />
            <MessageInput
              onSend={
                tab.username === "CHATROOM" ? sendValue : sendPrivateValue
              }
              handleWritingNotification={sendWritingNotification}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatRoom;
