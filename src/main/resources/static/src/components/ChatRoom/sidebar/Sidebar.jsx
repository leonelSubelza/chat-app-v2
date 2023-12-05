import React,{useContext,useEffect,useState} from 'react';
import MembersList from './MemberList/MembersList.jsx';
import { userContext } from '../../../context/UserDataContext';
//import menuHamburger from '../../../assets/menu-burger.svg';
import './Sidebar.css';
import ModalIconChooser from '../../register/modals/item-chooser/ModalIconChooser.jsx';
import { createPublicMessage } from '../ChatRoomFunctions.js';

const Sidebar = ({ sidebarOpen,disconnectChat,handleSideBarOpen }) => {

    const { userData,setUserData,
        startedConnection,channelExists, stompClient } = useContext(userContext);

    //MOdal icon chooser
    const [showModalIconChooser, setShowModalIconChooser] = useState(false);

    const handleDisconnectChat = ()=>{
        return disconnectChat();
    }
    const toggleSidebar = () => {
        return handleSideBarOpen();
    };


    const handleCloseModalIconChooser = (iconChoosed) => {
        setShowModalIconChooser(false)
        if (iconChoosed !== '') {
            console.log("se cambia icono, stompClient:");
            console.log(userData);
            //Preguntamos si está conectado en una sala, entonces le avisamos a todos de act
            if(startedConnection.current && userData.connected
                && stompClient.current !== null){
                    let userUpdate = {...userData, "avatarImg": iconChoosed};
                    var chatMessage = createPublicMessage('UPDATE', userUpdate);
                    stompClient.current.send("/app/group-message", {}, JSON.stringify(chatMessage));
                }
            setUserData({ ...userData, "avatarImg": iconChoosed });
        }
    };

    return (
        <div className={`sidebar ${sidebarOpen ? '' : 'close'}`}>
            <div className="menu-details">
                <i className="bi bi-list menu-hamburger" onClick={toggleSidebar}></i>
                <span className="logo_name">Chat-App</span>
                <button className="btn-leave" onClick={handleDisconnectChat}>Leave</button>
            </div>

            <MembersList/>
            <div className='sidebar-user-info-container'>
                <div className="profile-details">
                    <img 
                    className="profile-details__img" 
                    src={`${userData.avatarImg}`} 
                    alt="icon" 
                    onClick={()=>setShowModalIconChooser(true)}
                    />
                    <p className="profile_name">{userData.username}</p>
                </div>
            </div>
            <ModalIconChooser showModalIconChooser={showModalIconChooser} handleCloseModalIconChooser={handleCloseModalIconChooser} />
        </div>
    );
};

export default Sidebar;