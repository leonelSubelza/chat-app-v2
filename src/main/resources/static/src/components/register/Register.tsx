import type { ChatRoomConnectionContextType, UserDataContextType, UserDataSaveLocalStorage,} from "../../context/types/types.ts";
import React, { useContext, useState } from "react";
import { userContext} from "../../context/UserDataContext.tsx";
import { chatRoomConnectionContext } from "../../context/ChatRoomConnectionContext.tsx";
import ModalIconChooser from "./modals/item-chooser/ModalIconChooser.tsx";
import ModalJoinChat from "./modals/join-chat/ModalJoinChat.tsx";
import { useEffect } from "react";
import "./Register.css";
import { MessagesStatus } from "../interfaces/messages.status.ts";
import { generateRoomId } from "../../utils/IdGenerator.ts";
import { ChatUserRole } from "../interfaces/chatRoom.types.ts";
import { Navigate } from "react-router-dom";
import { maxUsernameLength } from "./../../config/chatConfiguration.ts"


import {
  loadLocalStorageObject,
  saveLocalStorageObject,
  saveUserDataStorage
} from "../../utils/localStorageFunctions.ts";
import {Toaster, toast} from "sonner";

const Register: React.FC = () => {
  const { userData, setUserData, isDataLoading, stompClient,imageLinks } = useContext(userContext) as UserDataContextType;
  const { checkIfChannelExists, disconnectChat, startedConnection,lostConnection } =
    useContext(chatRoomConnectionContext) as ChatRoomConnectionContextType;

  //MOdal icon chooser
  const [showModalIconChooser, setShowModalIconChooser] = useState<boolean>(false);
  //Modal join chat
  const [showModalJoinChat, setShowModalJoinChat] = useState<boolean>(false);

  const handleCloseModalIconChooser = (iconChoosed: string) => {
    setShowModalIconChooser(false);
    if (iconChoosed !== "") {
      setUserData({ ...userData, avatarImg: iconChoosed });
      let userDataStorage =  loadLocalStorageObject("userData");
      userDataStorage.avatarImg = iconChoosed;
      saveLocalStorageObject("userData",userDataStorage);
    }
  };
  const handleShowModalIconChooser = () => setShowModalIconChooser(true);

  const handleShowModalJoinChat = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (userData.username === "") {
      toast.error('You must write a username')
      return;
    }
    setShowModalJoinChat(true);
  };

  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if(value.length>maxUsernameLength){
      console.log("la cant de caracteres es mayor a 255");
      return;
    }
    setUserData({ ...userData, username: value });
    //saved in localstorage to
    let userDataStorage: UserDataSaveLocalStorage =  loadLocalStorageObject("userData");
    userDataStorage.username = value;
    saveLocalStorageObject("userData",userDataStorage);
  };

  const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if(lostConnection.current){
      alert('Unable to create a room as connection to server has been lost!');
      return;
    }

    if (userData.username === '') {
      toast.error('You must write a username')
      return;
    }
    if (userData.avatarImg === '') {
      toast.error('You must choose a image')
      return;
    }
    let idRoom: string = generateRoomId();
    userData.status = MessagesStatus.CREATE;
    userData.chatRole = ChatUserRole.ADMIN;
    userData.urlSessionid = idRoom;
    setUserData({
      ...userData,
      status: MessagesStatus.CREATE,
      chatRole: ChatUserRole.ADMIN,
      urlSessionid: idRoom,
    });
    checkIfChannelExists();
  };

  useEffect(() => {
    //si se hace <- desde el navegador se cierra la conexion cuando se carga este componente pq no
    //puedo capturar el evento cuando se hace para atrás en chatroom :(
    if ( userData.connected && Object.keys(stompClient.current.subscriptions).length > 0) {
      disconnectChat(false);
      window.location.reload();
    }
    //overrides these variables because it doesn't load at this moment.
    if (userData.username === '' && loadLocalStorageObject("userData")!==null) {
      let userDataStorage = loadLocalStorageObject("userData");
      userData.username = userDataStorage.username;
      userData.avatarImg = userDataStorage.avatarImg;
    }

    // sound.src="../../public/sound/Ding.mp3";
  }, []);

  return (
    <>
      {/* cuando se carga este componente la url se setea en '/chat-app-v2/' */}
      <Navigate to={`/chat-app-v2/`} />
      {( (startedConnection.current && !isDataLoading && userData.connected) 
      || lostConnection.current) 
      && (
        <>
          <div className="register-container">
            <div className="register">
              <h1 className="register-title">CHAT ROOM</h1>
              <div className="register-icon-container">
                <div
                  className="icon-img-contenedor"
                  style={{
                    backgroundImage: `url(${loadLocalStorageObject("userData").avatarImg})`,
                  }}
                ></div>
                <button className="icon-edit-btn" onClick={handleShowModalIconChooser}>
                  <i className="bi bi-pencil"></i>
                </button>
              </div>

              <div className="register-input__container">
                <input
                  id="user-name"
                  className="user-name"
                  placeholder="Enter a username"
                  name="userName"
                  value={userData.username}
                  onChange={handleUsername}
                  autoFocus
                />
                <button
                  type="button"
                  className="button"
                  onClick={handleShowModalJoinChat}
                >
                  <i className="bi bi-box-arrow-in-right"></i><p>JOIN A CHAT</p>
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleCreateRoom}
                >
                  <i className="bi bi-pencil-square"></i><p>CREATE A ROOM</p>
                </button>
              </div>
            </div>
          </div>
          <ModalIconChooser
            showModalIconChooser={showModalIconChooser}
            handleCloseModalIconChooser={handleCloseModalIconChooser}
          />
          <ModalJoinChat
            showModalJoinChat={showModalJoinChat}
            handleCloseModalJoinChat={()=>setShowModalJoinChat(false)}
          />
          <Toaster richColors position="bottom-center"/>
        </>
      )}
    </>
  );
};
export default Register;