import React, { useContext, useState } from "react";
import MembersList from "./MemberList/MembersList.jsx";
import { userContext } from "../../../context/UserDataContext.js";
import Toast from "react-bootstrap/Toast";
import "./Sidebar.css";
import ModalIconChooser from "../../register/modals/item-chooser/ModalIconChooser.jsx";
import { createPublicMessage } from "../ChatRoomFunctions.js";
import { chatRoomConnectionContext } from "../../../context/ChatRoomConnectionContext.js";
import { UserData } from "../../../context/types/types.js";
import { MessagesStatus } from "../../interfaces/messages.status.js";
import { Message } from "../../interfaces/messages.js";
import adminImg from "../../../assets/crown-icon.svg";
import { ChatUserRole } from "../../interfaces/chatRoom.types.js";
import BannedUsersList from "./bannedUsers/BannedUsersList.js";

interface Props {
  sidebarOpen: boolean;
  disconnectChat: () => void;
  handleSideBarOpen: () => void;
}

const Sidebar = ({ sidebarOpen, disconnectChat, handleSideBarOpen }: Props) => {
  const { userData, setUserData, stompClient } = useContext(userContext);
  const { startedConnection } = useContext(chatRoomConnectionContext);
  const [isShowMemberActive, setIsShowMemberActive] = useState<boolean>(true);

  //MOdal icon chooser
  const [showModalIconChooser, setShowModalIconChooser] =
    useState<boolean>(false);

  const [showToastCopied, setShowToastMessage] = useState<boolean>(false);

  const handleDisconnectChat = (): void => {
    return disconnectChat();
  };
  const toggleSidebar = (): void => {
    return handleSideBarOpen();
  };

  const handleCloseModalIconChooser = (iconChoosed: string): void => {
    setShowModalIconChooser(false);
    if (iconChoosed !== "") {
      //Preguntamos si está conectado en una sala, entonces le avisamos a todos de act
      if (
        startedConnection.current &&
        userData.connected &&
        stompClient.current !== null
      ) {
        let userUpdate: UserData = { ...userData, avatarImg: iconChoosed };
        var chatMessage: Message = createPublicMessage(
          MessagesStatus.UPDATE,
          userUpdate
        );
        stompClient.current.send(
          "/app/group-message",
          {},
          JSON.stringify(chatMessage)
        );
      }
      setUserData({ ...userData, avatarImg: iconChoosed });
    }
  };

  const copyInput = (): void => {
    setShowToastMessage(true);
    navigator.clipboard
      .writeText(window.location.toString())
      .then(() => {
        console.log("Text copied to clipboard! 📎");
      })
      .catch((err) => {
        console.error("Error in copying text: ", err);
      });
  };

  const handleClickOutsideSidebar = () => {
    return handleSideBarOpen();
  }

  return (
    <>
      <div className={`sidebar ${sidebarOpen ? "" : "close"}`}>
        <div className="menu-details">

          <div className="menu-details-item" onClick={()=> setIsShowMemberActive(true)}>
            <i className="bi bi-list menu-hamburger" onClick={toggleSidebar}></i>
          </div>
          <div className={`menu-details-item ${isShowMemberActive && 'active'}`} onClick={()=> setIsShowMemberActive(true)}>
            <i className="bi bi-chat-left"></i>
            <div className="menu-details-item-info">Chats</div>
          </div>
          
          <div className={`menu-details-item ${!isShowMemberActive && 'active'}`}  onClick={()=> setIsShowMemberActive(false)}>
            <i className="bi bi-person-fill-slash"></i>
            <div className="menu-details-item-info">Banned users</div>
          </div>
          <div className="menu-details-item" onClick={copyInput}>
            <i
              className="bi bi-clipboard url-input-icon"
              style={{ color: "white" }}
            ></i>
            <div className="menu-details-item-info">Copy URL</div>
          </div>
          <div className="menu-details-item" onClick={handleDisconnectChat}>
            <i className="bi bi-box-arrow-left btn-exit"></i>
            <div className="menu-details-item-info">Disconnect the chat</div>
          </div>      
        </div>

        <MembersList showMembers={isShowMemberActive}/>
        <BannedUsersList showBannedUserList={!isShowMemberActive} />
        <div className="sidebar-user-info-container">
          <div className="profile-details">
            <img
              className={`admin_img ${
                userData.chatRole === ChatUserRole.ADMIN && "active"
              }`}
              src={adminImg}
              alt="icon"
            />
            <img
              className="profile-details__img"
              src={`${userData.avatarImg}`}
              alt="icon"
              onClick={() => setShowModalIconChooser(true)}
            />
            <p className="profile_name">{userData.username}</p>
          </div>
        </div>
        <ModalIconChooser
          showModalIconChooser={showModalIconChooser}
          handleCloseModalIconChooser={handleCloseModalIconChooser}
        />
        <Toast
          onClose={() => setShowToastMessage(false)}
          show={showToastCopied}
          delay={800}
          animation={true}
          autohide
        >
          <Toast.Body>URL Copied to clipboard!</Toast.Body>
        </Toast>
      </div>
      <div 
      className={`sidebar-mobile-background ${sidebarOpen ? "" : "close"}`}
      onClick={handleClickOutsideSidebar}></div>
    </>
  );
};

export default Sidebar;
