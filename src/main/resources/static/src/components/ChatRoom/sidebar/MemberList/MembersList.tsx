import React, { useContext, useEffect, useState } from "react";
import "./MemberList.css";
import { userContext } from "../../../../context/UserDataContext";
import chatRoomIcon from "../../../../assets/people-icon.svg";
import adminImg from "../../../../assets/crown-icon.svg";
import { v4 as uuidv4 } from "uuid";
import { ChatUserRole, UserChat } from "../../../interfaces/chatRoom.types";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InfoModal from "../../../register/modals/info-modal/InfoModal";
import { createPrivateMessage } from "../../ChatRoomFunctions";
import { Message } from "../../../interfaces/messages";
import { MessagesStatus } from "../../../interfaces/messages.status";

interface Props {
  showMembers: boolean;
}

const MembersList = ({showMembers}: Props) => {
  const { tab, setTab, chats, userData,stompClient } = useContext(userContext);

  const [showModalBanUser, setShowModalBanUser] = useState<boolean>(false);
  const [showModalMakeAdmin, setShowModalMakeAdmin] = useState<boolean>(false);

  const [userToHandle, setUserToHandle] = useState<UserChat>();
  
  //const chatRoomIcon = require('../../../../assets/people-icon.svg') as string;
  const onUserChatClick = (
    chatData: UserChat
  ) => {
    chatData.hasUnreadedMessages = false;
    setTab(chatData);
  };

  const handleCloseModalBanning = (resp: boolean) => {
    setShowModalBanUser(false);
    if (!resp) {
      setUserToHandle(null);
      return;
    }
    console.log("se banea al wacho");
    if (stompClient.current) {
      let message: Message = createPrivateMessage(MessagesStatus.BAN,userData,userToHandle.username,userToHandle.id);
      stompClient.current.send("/app/group-message", {}, JSON.stringify(message));
    }
  };

  const handleCloseModalMakeAdmin = (resp: boolean) => {
    setShowModalMakeAdmin(false);
    if (!resp) {
      setUserToHandle(null);
      return;
    }
    if (stompClient.current) {
      let message: Message = createPrivateMessage(MessagesStatus.MAKE_ADMIN,userData,userToHandle.username,userToHandle.id);
      stompClient.current.send("/app/group-message", {}, JSON.stringify(message));
    }
  }

  //React.MouseEvent<HTMLButtonElement>
  const handleBanUser = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    userToBan: UserChat
  ) => {
    setShowModalBanUser(true);
    setUserToHandle(userToBan);
  };
  const handleMakeAdmin = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    userToMakeAdmin: UserChat
  ) => {
    setShowModalMakeAdmin(true);
    setUserToHandle(userToMakeAdmin);
  };

  useEffect(()=>{
    const chatContainer = document.querySelector(".scroll-messages");
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  },[tab])

  return (
    <div className={`sidebar-nav-links-container ${showMembers && 'active'}`}>
      <ul className="sidebar-nav-links">
        <li
          onClick={(e) => onUserChatClick(Array.from(chats.keys())[0])}
          className={`member ${tab.username === "CHATROOM" && "active"}`}
        >
          <div className="member-item">
            <img className="profile_img" src={chatRoomIcon} alt="icon" />
            <span className="link_name">CHAT GENERAL</span>
          </div>
          <div
            className={`member-item__icon-exclamation ${
              Array.from(chats.keys())[0].hasUnreadedMessages && "active"
            }`}
          >
            {/*<i className="bi bi-exclamation-octagon-fill"></i>*/}
            <i className="bi bi-chat-dots"></i>
          </div>
        </li>

        <div className="info-sidebar">
          <p>PRIVATE CHATS</p>
          <div className="separator-sidebar"></div>
        </div>

        {chats.size > 0 &&
          Array.from(chats.keys()).map(
            (chatData: UserChat) =>
              chatData.username !== "CHATROOM" && (
                <li
                  className={`member ${tab === chatData && "active"} ${
                    chatData.hasUnreadedMessages && "hasUnreadedMessages"
                  }`}
                  key={uuidv4()}
                >
                  <div className='member-item-container' onClick={(e) => onUserChatClick(chatData)}>
                    <div className="member-item">
                      <img
                        className="profile_img"
                        src={`${chatData.avatarImg}`}
                        alt="icon"
                      />
                      <span className="link_name">{chatData.username}</span>
                      <img
                        className={`admin_img ${
                          chatData.chatRole === ChatUserRole.ADMIN && "active"
                        }`}
                        src={adminImg}
                        alt="icon"
                      />
                    </div>
                  </div>
                  <DropdownButton
                    key={"end"}
                    id={`dropdown-button-drop`}
                    className={`${
                      userData.chatRole === ChatUserRole.ADMIN && "active"
                    }`}
                    drop={"end"}
                    variant="secondary"
                    title={<i className="bi bi-three-dots-vertical"></i>}
                  >
                    <Dropdown.Item
                      className="dropdown-ban-btn"
                      eventKey="1"
                      onClick={(e) => handleBanUser(e, chatData)}
                    >
                      Ban
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-make-admin-btn"
                      eventKey="2"
                      onClick={(e) => handleMakeAdmin(e, chatData)}
                    >
                      Make admin
                    </Dropdown.Item>
                  </DropdownButton>
                  <div
                    className={`member-item__icon-exclamation ${
                      chatData.hasUnreadedMessages && "active"
                    }`}
                  >
                    {/*<i className="bi bi-exclamation-octagon-fill"></i>*/}
                    <i className="bi bi-chat-dots"></i>
                  </div>
                </li>
              )
          )}
        <InfoModal
          title={"Warning"}
          text={"Está seguro que desea expulsar de la sala a este usuario?"}
          show={showModalBanUser}
          infoCloseBtn={"Cancelar"}
          infoAcceptBtn={"Expulsar"}
          handleCloseInfoModal={handleCloseModalBanning}
        />
        <InfoModal
          title={"Warning"}
          text={"Se convertirá a este usuario en el nuevo admin. Está seguro?"}
          show={showModalMakeAdmin}
          infoCloseBtn={"Cancelar"}
          infoAcceptBtn={"Aceptar"}
          handleCloseInfoModal={handleCloseModalMakeAdmin}
        />
      </ul>
    </div>
  );
};
export default MembersList;
