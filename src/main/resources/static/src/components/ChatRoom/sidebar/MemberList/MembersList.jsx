import React, { useContext } from 'react'
import './MemberList.css'
import { userContext } from '../../../../context/UserDataContext';

const MembersList = () => {

    const { chatroomData,setChatroomData } = useContext(userContext);

    return (
        <>
            <ul className="nav-links">
                <li onClick={() => setTab("CHATROOM")} className={`member ${chatroomData.tab === "CHATROOM" && "active"} `}>
                    <a href="#">
                        <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon" />
                        <span className="link_name">CHAT GENERAL</span>
                    </a>
                </li>

                <div className="info-sidebar">
                    <p>CHAT PRIVATE</p>
                    <div className="separator-sidebar"></div>
                </div>

                {chatroomData.privateChats.size > 0 && [...chatroomData.privateChats.keys()].map((name, index) => (
                    <li onClick={() => { setTab(name) }} className={`member ${chatroomData.tab === name && "active"}`} key={index}>
                        <a href="#">
                            <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon" />
                            <span className="link_name">{name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </>
    )
}
export default MembersList;