import React, { useContext } from 'react'
import './MemberList.css'
import { userContext } from '../../../../context/UserDataContext';
import chatRoomIcon from '../../../../assets/people-icon.svg';
import { v4 as uuidv4 } from 'uuid';

const MembersList = () => {

    const { tab, setTab, privateChats, publicChats, chats, setChats } = useContext(userContext);

    return (
        <div className='sidebar-nav-links-container'>
            <ul className="sidebar-nav-links">
                <li 
                onClick={() => {
                    Array.from(chats.keys())[0].hasUnreadedMessages = false;
                    setTab(Array.from(chats.keys())[0])}
                } 
                className={`member ${tab.username === "CHATROOM" && "active"} ${Array.from(chats.keys())[0].hasUnreadedMessages && 'hasUnreadedMessages'}`}>
                    <div className='member-item'>
                        <img className="profile_img" src={chatRoomIcon} alt="icon" />
                        <span className="link_name">CHAT GENERAL</span>
                    </div>
                </li>

                <div className="info-sidebar">
                    <p>CHAT PRIVATE</p>
                    <div className="separator-sidebar"></div>
                </div>

                {chats.size > 0 && Array.from(chats.keys()).map((chatData) => (
                    chatData.username !== 'CHATROOM' &&
                    <li
                        onClick={()=>{
                            chatData.hasUnreadedMessages = false;
                            setTab(chatData);
                        }}
                        className={`member ${tab === chatData && "active"} ${chatData.hasUnreadedMessages && 'hasUnreadedMessages'}`}
                        key={uuidv4()}>
                        <div className='member-item'>
                            <img className="profile_img" src={`${chatData.avatarImg}`} alt="icon" />
                            <span className="link_name">{chatData.username}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default MembersList;

/*
        <div className='sidebar-nav-links-container'>
            <ul className="sidebar-nav-links">
                <li onClick={() => setTab("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"} `}>
                    <div className='member-item'>
                        <img className="profile_img" src={chatRoomIcon} alt="icon" />
                        <span className="link_name">CHAT GENERAL</span>
                    </div>
                </li>

                <div className="info-sidebar">
                    <p>CHAT PRIVATE</p>
                    <div className="separator-sidebar"></div>
                </div>

                {privateChats.size > 0 && [...privateChats.keys()].map((name, index) => (
                    <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index}>
                    <div className='member-item'>
                        <img className="profile_img" src={`${name.avatarImg}`} alt="icon" />
                        <span className="link_name">{name.username}</span>
                    </div>
                </li>
                ))}
            </ul>
        </div>
*/