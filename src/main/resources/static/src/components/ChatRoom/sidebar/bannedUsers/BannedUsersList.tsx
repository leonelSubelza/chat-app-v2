import { useContext, useState } from "react";
import { userContext } from "../../../../context/UserDataContext";
import "./BannedUsersList.css";
import "../MemberList/MemberList.css";
import { v4 as uuidv4 } from "uuid";
import { ChatUserRole, UserChat } from "../../../interfaces/chatRoom.types";
import { Dropdown, DropdownButton } from "react-bootstrap";
import InfoModal from "../../../register/modals/info-modal/InfoModal";
import { Message } from "../../../interfaces/messages";
import { createPrivateMessage } from "../../ChatRoomFunctions";
import { MessagesStatus } from "../../../interfaces/messages.status";

interface Props {
  showBannedUserList: boolean;
}

const BannedUsersList = ({ showBannedUserList }: Props) => {
  const { bannedUsers, stompClient, userData } = useContext(userContext);
  const [showModalUnBanUser, setShowModalUnBanUser] = useState<boolean>(false);
  const [userToUnBan, setUserToUnban] = useState<UserChat>(undefined);

  const handleUnBanUser = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    userToUnban: UserChat
  ) => {
    setShowModalUnBanUser(true);
    setUserToUnban(userToUnban);
  };

  const handleCloseModalUnBanning = (resp: boolean) => {
    setShowModalUnBanUser(false);
    if (!resp) {
      setUserToUnban(undefined);
      return;
    }
    if (stompClient.current) {
      let message: Message = createPrivateMessage(
        MessagesStatus.UNBAN,
        userData,
        userToUnBan.username,
        userToUnBan.id
      );
      stompClient.current.send(
        "/app/group-message",
        {},
        JSON.stringify(message)
      );
    }
  };

  return (
    <div
      className={`sidebar-nav-links-container banned-users-list-container ${
        showBannedUserList && "active"
      }`}
    >
      <ul className="sidebar-nav-links banned-users-list">
        <li className={`member banned-users-title-container`}>
          <div className="banned-users-title">
            {/* <i className="bi bi-caret-down-fill"></i> */}
            <span className="link_name">Banned Users</span>
          </div>
        </li>

        {bannedUsers.length > 0 &&
          bannedUsers.map((chatData: UserChat) => (
            <li className={`member`} key={uuidv4()}>
              <div className="member-item">
                <img
                  className="profile_img"
                  src={`${chatData.avatarImg}`}
                  alt="icon"
                />
                <span className="link_name">{chatData.username}</span>
              </div>
              <DropdownButton
                key={"end"}
                className={`${
                  userData.chatRole === ChatUserRole.ADMIN && "active"
                }`}
                id={`dropdown-button-drop`}
                drop={"end"}
                variant="secondary"
                title={<i className="bi bi-three-dots-vertical"></i>}
              >
                <Dropdown.Item
                  className="dropdown-ban-btn"
                  eventKey="1"
                  onClick={(e) => handleUnBanUser(e, chatData)}
                >
                  Unban
                </Dropdown.Item>
              </DropdownButton>
            </li>
          ))}
      </ul>
      <InfoModal
        title={"Warning"}
        text={"Está seguro que desea desbanear a este usuario?"}
        show={showModalUnBanUser}
        infoCloseBtn={"Cancelar"}
        infoAcceptBtn={"Desbanear"}
        handleCloseInfoModal={handleCloseModalUnBanning}
      />
    </div>
  );
};

export default BannedUsersList;
