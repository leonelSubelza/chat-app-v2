import React, { useState, useEffect, useContext, useRef } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import "./ChatRoom.css";
import { userContext } from "../../context/UserDataContext";
import { chatRoomConnectionContext } from "../../context/ChatRoomConnectionContext";
import MessageInput from "./MessageInput/MessageInput.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";
import { getRoomIdFromURL } from "../../utils/InputValidator.js";
import { createPrivateMessage, createPublicMessage } from "./ChatRoomFunctions";
import ChatContainer from "./chat-container/ChatContainer.jsx";
import { MessagesStatus } from "../interfaces/messages.status";
import { Message } from "../interfaces/messages";

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

  const { startedConnection } = useContext(chatRoomConnectionContext);

  const { disconnectChat, checkIfChannelExists } = useContext(
    chatRoomConnectionContext
  );

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const connect = (): void => {
    if (stompClient.current === null) {
      return;
    }
    if (!startedConnection.current || isDataLoading || !userData.connected) {
      return;
    }

    if (
      userData.username === "" ||
      localStorage.getItem("username") === null ||
      localStorage.getItem("username") === "null"
    ) {
      let nombre: string = prompt("Ingrese un nombre de usuario");
      if (nombre === null) {
        alert("El nombre no puede ser vacío");
        disconnectChat(false);
        navigate("/");
        return;
      }
      localStorage.setItem("username", nombre);
      setUserData({ ...userData, username: nombre });
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
      var chatMessage: Message = createPublicMessage(status, userData);
      stompClient.current.send(
        "/app/group-message",
        {},
        JSON.stringify(chatMessage)
      );
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
      var chatMessage: Message = createPrivateMessage(
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
      stompClient.current.send(
        "/app/private-message",
        {},
        JSON.stringify(chatMessage)
      );
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

  const [writingMessage, setWritingMessage] = useState<string>();
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
      {channelExists && startedConnection.current && !isDataLoading ? (
        <div className="chatRoom-global">
          <Sidebar
            sidebarOpen={sidebarOpen}
            disconnectChat={handleDisconnectChat}
            handleSideBarOpen={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className={`chat-box`}>
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
      ) : (
        <div>Cargando...</div>
      )}
    </>
  );
};

export default ChatRoom;
