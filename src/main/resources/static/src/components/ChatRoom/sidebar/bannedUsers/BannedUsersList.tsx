import { useContext } from "react";
import { userContext } from "../../../../context/UserDataContext";
import "./BannedUsersList.css";
import "../MemberList/MemberList.css";
import { v4 as uuidv4 } from "uuid";
import { UserChat } from "../../../interfaces/chatRoom.types";
import { Dropdown, DropdownButton } from "react-bootstrap";

interface Props {
  showBannedUserList: boolean;
}

const BannedUsersList = ({ showBannedUserList }: Props) => {
  const { bannedUsers, setBannedUsers } = useContext(userContext);

  const handleUnBanUser = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    userToUnban: UserChat
  ) => {
    console.log('HAY QUE DESBANEAR A '+userToUnban.username);
  };

  return (
    <div
      className={`sidebar-nav-links-container banned-users-list-container ${showBannedUserList && "active"}`}
    >
      <ul className="sidebar-nav-links banned-users-list">
          <li   
          className={`member banned-users-title-container`}
        >
            <div className="banned-users-title">
                <i className="bi bi-caret-down-fill"></i>
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
                className={`active`}
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
    </div>
  );
};

export default BannedUsersList;
