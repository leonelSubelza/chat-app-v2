import React, { useContext, useState } from "react";
import MembersList from "./MemberList/MembersList.jsx";
import { userContext } from "../../../context/UserDataContext.js";
import { Toaster, toast } from 'sonner'
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
import {copyInputSuccessful} from "../../../utils/InputFunctions.ts";
import {Tooltip} from "react-tooltip";

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

  const showSonnerMessage = () => {
    toast.info("URL Copied to clipboard!",{
      style: {
        background: '#383258',
        color: "#fff",
      },
      className: 'class',
    });
  }

  const copyInput = (): void => {
    if (copyInputSuccessful(window.location.toString())){
      showSonnerMessage();
    }
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
            <i id={'chats-tooltip'} className="bi bi-chat-left"></i>
            {/*<div className="menu-details-item-info">Chats</div>*/}
            <Tooltip anchorSelect="#chats-tooltip" className="tooltip-sidebar" content={`Chats`} place={"bottom"} />
          </div>
          
          <div className={`menu-details-item ${!isShowMemberActive && 'active'}`}  onClick={()=> setIsShowMemberActive(false)}>
            <i id={'banned-users-tooltip'} className="bi bi-person-fill-slash"></i>
            {/*<div className="menu-details-item-info">Banned users</div>*/}
            <Tooltip anchorSelect="#banned-users-tooltip" className="tooltip-sidebar" content={`Banned users`} place={"bottom"} />
          </div>
          <div className="menu-details-item" onClick={copyInput}>
            <i id={'copy-URL-tooltip'}
              className="bi bi-clipboard url-input-icon"
              style={{ color: "white" }}
            ></i>
            {/*<div className="menu-details-item-info">Copy URL</div>*/}
            <Tooltip anchorSelect="#copy-URL-tooltip" className="tooltip-sidebar" content={`Copy URL`} place={"bottom"} />
          </div>
          <div className="menu-details-item" onClick={handleDisconnectChat}>
            <i id={'leave-the-room-tooltip'} className="bi bi-box-arrow-left btn-exit"></i>
            {/*<div className="menu-details-item-info">Leave the room</div>*/}
            <Tooltip anchorSelect="#leave-the-room-tooltip" className="tooltip-sidebar" content={`Leave the room`} place={"bottom"} />
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
        <Toaster richColors position="bottom-center"/>
      </div>
      <div 
      className={`sidebar-mobile-background ${sidebarOpen ? "" : "close"}`}
      onClick={handleClickOutsideSidebar}></div>
    </>
  );
};

export default Sidebar;
