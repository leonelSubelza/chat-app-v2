import React, { useContext, useState } from 'react'
import { useUserDataContext, userContext } from '../../context/UserDataContext';
import { chatRoomConnectionContext } from '../../context/ChatRoomConnectionContext.jsx';
import ModalIconChooser from './modals/item-chooser/ModalIconChooser.jsx';
import ModalJoinChat from './modals/join-chat/ModalJoinChat.jsx';
import { useEffect } from 'react';
import { imageLinks } from '../../services/avatarsLinks.js';
import './Register.css'

const Register = () => {
    const { userData, setUserData, isDataLoading,stompClient,channelExists } = useContext(userContext);
    const { checkIfChannelExists, disconnectChat, startedConnection } = useContext(chatRoomConnectionContext)

    //MOdal icon chooser
    const [showModalIconChooser, setShowModalIconChooser] = useState(false);
    //Modal join chat
    const [showModalJoinChat, setShowModalJoinChat] = useState(false);

    const handleCloseModalIconChooser = (iconChoosed) => {
        setShowModalIconChooser(false)
        if (iconChoosed !== '') {
            setUserData({ ...userData, "avatarImg": iconChoosed });

        }
    };
    const handleShowModalIconChooser = () => setShowModalIconChooser(true);

    const handleShowModalJoinChat = (e) => {
        e.preventDefault();
        if (userData.username === '') {
            alert('Se debe poner un nombre de usuario!');
            return;
        }
        setShowModalJoinChat(true);
    }

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });
        localStorage.setItem('username', value);
    }

    //esta funcion solo se ejecuta si cerras el modal, la conexion se realiza en ModalJoinChat
    const handleCloseModalJoinChat = (e) => {
        if (e === undefined) {
            //se hizo click en la x del modal (no hay evento creo)
            setShowModalJoinChat(false);
            return;
        }
        e.preventDefault();
    }

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (userData.username === '' && localStorage.getItem('username') === null ||
            localStorage.getItem('username') === '') {
            alert('se debe poner un nombre de usuario');
            return;
        }
        if (userData.avatarImg === '' || localStorage.getItem('avatarImg') === null) {
            alert('Debe seleccionar una imagen');
            return;
        }
        //se debería crear un id
        let idRoom = '1234';
        userData.status = 'CREATE';
        setUserData({ ...userData, "status": 'CREATE', "URLSessionid": idRoom });
        checkIfChannelExists(idRoom);
    }

    useEffect(() => {
        console.log("se carga componente Register");
        //si se hace <- desde el navegador se cierra la conexion cuando se carga este componente pq no 
        //puedo capturar el evento cuando se hace para atrás en chatroom :(
        if (userData.connected && !channelExists &&
            Object.keys(stompClient.current.subscriptions).length>0) {
            var chatMessage = {
                senderId:userData.userId,
                senderName: userData.username,
                urlSessionId: userData.URLSessionid,
                status: 'LEAVE',
                avatarImg: userData.avatarImg
            }
            stompClient.current.send("/app/user.disconnected", {}, JSON.stringify(chatMessage));
            disconnectChat();
        }
    }, [])

    useEffect(() => {
        if (localStorage.getItem('avatarImg') === null) {
            localStorage.setItem('avatarImg', imageLinks[0]);
        }
    })

    return (
        <>
            {startedConnection.current && !isDataLoading && userData.connected ?
                <>
                    <div className='register-container'>
                        <div className="register">
                            <h1 className='register-title'>CHAT ROOM</h1>
                            <div className='register-icon-container'>
                                <div
                                    className='icon-img-contenedor'
                                    style={
                                        { backgroundImage: `url(${localStorage.getItem('avatarImg') === null ? imageLinks[0] : localStorage.getItem('avatarImg')})` }
                                    }></div>
                                <button className='icon-edit-btn' onClick={handleShowModalIconChooser}><i className="bi bi-pencil"></i></button>
                            </div>

                            <div className='register-input__container'>
                                <input
                                    id="user-name"
                                    className="user-name"
                                    placeholder="Enter a username"
                                    name="userName"
                                    value={userData.username}
                                    onChange={handleUsername}
                                    margin="normal"
                                    autoFocus
                                />
                                <button type="button" className='button btn-join-chat' onClick={handleShowModalJoinChat}>
                                    <i className="bi bi-box-arrow-in-right"></i>JOIN A CHAT
                                </button>
                                <button type="button" className='button btn-create-room' onClick={handleCreateRoom}>
                                    <i className="bi bi-pencil-square"></i>CREATE A ROOM
                                </button>
                            </div>
                        </div>
                    </div>
                    <ModalIconChooser showModalIconChooser={showModalIconChooser} handleCloseModalIconChooser={handleCloseModalIconChooser} />
                    <ModalJoinChat showModalJoinChat={showModalJoinChat} handleCloseModalJoinChat={handleCloseModalJoinChat} />
                </>
                :
                <div>Cagando</div>}
        </>
    )

}
export default Register;