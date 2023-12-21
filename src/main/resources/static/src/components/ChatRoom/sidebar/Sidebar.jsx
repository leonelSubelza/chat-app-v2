import React,{useContext,useEffect,useState} from 'react';
import MembersList from './MemberList/MembersList.jsx';
import { userContext } from '../../../context/UserDataContext';
import Toast from 'react-bootstrap/Toast';
//import menuHamburger from '../../../assets/menu-burger.svg';
import './Sidebar.css';
import ModalIconChooser from '../../register/modals/item-chooser/ModalIconChooser.jsx';
import { createPublicMessage } from '../ChatRoomFunctions.js';

const Sidebar = ({ sidebarOpen,disconnectChat,handleSideBarOpen }) => {

    const { userData,setUserData,
        startedConnection,channelExists, stompClient } = useContext(userContext);

    //MOdal icon chooser
    const [showModalIconChooser, setShowModalIconChooser] = useState(false);

    const [showToastCopied, setShowToastMessage] = useState(false);

    const handleDisconnectChat = ()=>{
        return disconnectChat();
    }
    const toggleSidebar = () => {
        return handleSideBarOpen();
    };


    const handleCloseModalIconChooser = (iconChoosed) => {
        setShowModalIconChooser(false)
        if (iconChoosed !== '') {
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

    const copyInput = () => {
        setShowToastMessage(true);
        navigator.clipboard.writeText(window.location)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Error in copying text: ', err);
        });
    }
    
    return (
        <div className={`sidebar ${sidebarOpen ? '' : 'close'}`}>
            <div className="menu-details">
                <i className="bi bi-list menu-hamburger" onClick={toggleSidebar}>{`${"<-"}`}</i>
                <span className="logo_name">Chat-App</span>
                <i className="bi bi-clipboard url-input-icon" style={{color:"white"}} onClick={copyInput}></i>
                
                <button className="btn-leave" onClick={handleDisconnectChat}>
                    Leave <i className="bi bi-box-arrow-left"></i>
                </button>
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
            <Toast onClose={() => setShowToastMessage(false)} show={showToastCopied} delay={3000} autohide>
                <Toast.Body>Copied!</Toast.Body>
            </Toast>
        </div>
    );
};

export default Sidebar;