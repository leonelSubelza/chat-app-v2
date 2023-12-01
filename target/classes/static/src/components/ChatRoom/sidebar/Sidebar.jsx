import React,{useContext,useEffect} from 'react';
import MembersList from './MemberList/MembersList.jsx';
import { userContext } from '../../../context/UserDataContext';
import menuHamburger from '../../../assets/menu-burger.svg';
import './Sidebar.css';


const Sidebar = ({ sidebarOpen,disconnectChat,handleSideBarOpen }) => {

    const { userData,setUserData } = useContext(userContext);
    const handleDisconnectChat = ()=>{
        return disconnectChat();
    }
    const toggleSidebar = () => {
        return handleSideBarOpen();
    };

    return (
        <div className={`sidebar ${sidebarOpen ? '' : 'close'}`}>
            <div className="menu-details">
                <img className="menu-hamburger" src={menuHamburger} onClick={toggleSidebar} alt="menu" />
                <span className="logo_name">Chat-App</span>
                <button className="btn-leave" onClick={handleDisconnectChat}>Leave</button>
            </div>

            <MembersList/>
            <div className='sidebar-user-info-container'>
                <div className="profile-details">
                    <img className="profile-details__img" src={`${userData.avatarImg}`} alt="icon" />
                    <p className="profile_name">{userData.username}</p>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;