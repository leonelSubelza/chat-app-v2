import React, { useContext, useState } from "react";
import "./MemberList.css";
import { userContext } from "../../../../context/UserDataContext";
import chatRoomIcon from "../../../../assets/people-icon.svg";
import adminImg from "../../../../assets/crown-icon.svg";
import { v4 as uuidv4 } from "uuid";
import { ChatRole, UserChat } from "../../../interfaces/chatRoom.types";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import SplitButton from "react-bootstrap/SplitButton";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InfoModal from "../../../register/modals/info-modal/InfoModal";

const MembersList = () => {
  const { tab, setTab, chats, userData } = useContext(userContext);

  const [show, setShow] = useState(false);

  //const chatRoomIcon = require('../../../../assets/people-icon.svg') as string;
  const onUserChatClick = (
    e: React.MouseEvent<HTMLLIElement>,
    chatData: UserChat
  ) => {
    chatData.hasUnreadedMessages = false;
    setTab(chatData);
  };

  const handleCloseModalBanning = (resp: boolean) => {
    setShow(false)
    if (!resp) {
      return;
    }
    console.log("se banea al wacho");
    
  };

  //React.MouseEvent<HTMLButtonElement>
  const handleBanUser = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    id: string
  ) => {
    console.log("se esechucha el banbtn");
    setShow(true)
    /*return (
    )
    */
  };
  const handleMakeAdmin = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    id: string
  ) => {};

  return (
    <div className="sidebar-nav-links-container">
      <ul className="sidebar-nav-links">
        <li
          onClick={(e) => onUserChatClick(e, Array.from(chats.keys())[0])}
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
            <i className="bi bi-exclamation-octagon-fill"></i>
          </div>
        </li>

        <div className="info-sidebar">
          <p>CHAT PRIVATE</p>
          <div className="separator-sidebar"></div>
        </div>

        {chats.size > 0 &&
          Array.from(chats.keys()).map(
            (chatData: UserChat) =>
              chatData.username !== "CHATROOM" && (
                <li
                  onClick={(e) => onUserChatClick(e, chatData)}
                  className={`member ${tab === chatData && "active"} ${
                    chatData.hasUnreadedMessages && "hasUnreadedMessages"
                  }`}
                  key={uuidv4()}
                >
                  <div className="member-item">
                    <img
                      className="profile_img"
                      src={`${chatData.avatarImg}`}
                      alt="icon"
                    />
                    <span className="link_name">{chatData.username}</span>
                    <img
                      className={`admin_img ${
                        chatData.chatRole === ChatRole.ADMIN && "active"
                      }`}
                      src={adminImg}
                      alt="icon"
                    />
                  </div>
                  <DropdownButton
                    key={"end"}
                    id={`dropdown-button-drop`}
                    className={`${
                      userData.chatRole === ChatRole.ADMIN && "active"
                    }`}
                    drop={"end"}
                    variant="secondary"
                    title=<i className="bi bi-three-dots-vertical"></i>
                  >
                    <Dropdown.Item
                      className="dropdown-ban-btn"
                      eventKey="1"
                      onClick={(e) => handleBanUser(e, chatData.id)}
                    >
                      Ban
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-make-admin-btn"
                      eventKey="2"
                      onClick={(e) => handleMakeAdmin(e, chatData.id)}
                    >
                      Make admin
                    </Dropdown.Item>
                  </DropdownButton>
                  <div
                    className={`member-item__icon-exclamation ${
                      chatData.hasUnreadedMessages && "active"
                    }`}
                  >
                    <i className="bi bi-exclamation-octagon-fill"></i>
                  </div>
                </li>
              )
          )}
        <InfoModal
          title={"Warning"}
          text={"Esta seguro que desea expulsar de la sala a este usuario"}
          show={show}
          infoCloseBtn={"Cancel"}
          infoAcceptBtn={"Accept"}
          handleCloseInfoModal={handleCloseModalBanning}
        />
      </ul>
    </div>
  );
};
export default MembersList;
