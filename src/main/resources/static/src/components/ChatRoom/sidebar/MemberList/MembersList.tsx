import React, { useContext } from 'react'
import './MemberList.css'
import { userContext } from '../../../../context/UserDataContext';
import chatRoomIcon from '../../../../assets/people-icon.svg';
import { v4 as uuidv4 } from 'uuid';
import { UserChat } from '../../../interfaces/chatRoom.types';

const MembersList = () => {
    const { tab, setTab, chats } = useContext(userContext);

    //const chatRoomIcon = require('../../../../assets/people-icon.svg') as string;
    const onUserChatClick = (e: React.MouseEvent<HTMLLIElement>,chatData: UserChat) =>{
        chatData.hasUnreadedMessages = false;
        setTab(chatData);
    }

    return (
        <div className='sidebar-nav-links-container'>
            <ul className="sidebar-nav-links">
                <li
                    onClick={(e) => onUserChatClick(e,Array.from(chats.keys())[0])}
                    className={`member ${tab.username === "CHATROOM" && "active"}`}>
                    <div className='member-item'>
                        <img className="profile_img" src={chatRoomIcon} alt="icon" />
                        <span className="link_name">CHAT GENERAL</span>
                    </div>
                    <div className={`member-item__icon-exclamation ${Array.from(chats.keys())[0].hasUnreadedMessages && 'active'}`}><i className="bi bi-exclamation-octagon-fill"></i></div>
                </li>

                <div className="info-sidebar">
                    <p>CHAT PRIVATE</p>
                    <div className="separator-sidebar"></div>
                </div>

                {chats.size > 0 && Array.from(chats.keys()).map((chatData: UserChat) => (
                    chatData.username !== 'CHATROOM' &&
                    <li
                        onClick={(e) => onUserChatClick(e,chatData)}
                        className={`member ${tab === chatData && "active"} ${chatData.hasUnreadedMessages && 'hasUnreadedMessages'}`}
                        key={uuidv4()}>
                        <div className='member-item'>
                            <img className="profile_img" src={`${chatData.avatarImg}`} alt="icon" />
                            <span className="link_name">{chatData.username}</span>
                        </div>
                        <div className={`member-item__icon-exclamation ${chatData.hasUnreadedMessages && 'active'}`}><i className="bi bi-exclamation-octagon-fill"></i></div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default MembersList;