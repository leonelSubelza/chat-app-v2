import React, { useContext } from 'react'
import './MemberList.css'
import { userContext } from '../../../../context/UserDataContext';

const MembersList = () => {

    const { tab,setTab,privateChats,publicChats } = useContext(userContext);

    return (
        <div className='sidebar-nav-links-container'>
            <ul className="sidebar-nav-links">
                <li onClick={() => setTab("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"} `}>
                    <div className='member-item'>
                        <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon" />
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
                            <img className="profile_img" src='https://cdn-icons-png.flaticon.com/128/666/666201.png' alt="icon" />
                            <span className="link_name">{name}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default MembersList;