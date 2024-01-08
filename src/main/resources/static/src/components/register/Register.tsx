import type { ChatRoomConnectionContextType, UserDataContextType } from '../../context/types/types.js';
import type { Message } from '../interfaces/messages.js';
import React, { useContext, useState } from 'react'
import { useUserDataContext, userContext } from '../../context/UserDataContext.jsx';
import { chatRoomConnectionContext } from '../../context/ChatRoomConnectionContext.jsx';
import ModalIconChooser from './modals/item-chooser/ModalIconChooser.jsx';
import ModalJoinChat from './modals/join-chat/ModalJoinChat.jsx';
import { useEffect } from 'react';
import { imageLinks } from '../../services/avatarsLinks.js';
import './Register.css'
import { getActualDate } from '../../utils/MessageDateConvertor.js';
import { MessagesStatus } from '../interfaces/messages.status.js';

const Register: React.FC = () => {
    const { userData, setUserData, 
        isDataLoading,stompClient } = useContext(userContext) as UserDataContextType;
    const { checkIfChannelExists, disconnectChat, startedConnection } = useContext(chatRoomConnectionContext) as ChatRoomConnectionContextType;

    //MOdal icon chooser
    const [showModalIconChooser, setShowModalIconChooser] = useState<boolean>(false);
    //Modal join chat
    const [showModalJoinChat, setShowModalJoinChat] = useState<boolean>(false);

    const handleCloseModalIconChooser = (iconChoosed: string) => {
        setShowModalIconChooser(false);
        if (iconChoosed !== '') {
            setUserData({ ...userData, "avatarImg": iconChoosed });

        }
    };
    const handleShowModalIconChooser = () => setShowModalIconChooser(true);

    const handleShowModalJoinChat = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (userData.username === '') {
            alert('Se debe poner un nombre de usuario!');
            return;
        }
        setShowModalJoinChat(true);
    }

    const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });
        localStorage.setItem('username', value);
    }

    //esta funcion solo se ejecuta si cerras el modal, la conexion se realiza en ModalJoinChat
    const handleCloseModalJoinChat = (e: any) => {
        if (e === undefined) {
            //se hizo click en la x del modal (no hay evento creo)
            setShowModalJoinChat(false);
            return;
        }
        e.preventDefault();
    }

    const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        let idRoom: string = '1234';
        userData.status = MessagesStatus.CREATE;
        setUserData({ ...userData, "status": MessagesStatus.CREATE, "URLSessionid": idRoom });
        checkIfChannelExists(idRoom);
    }

    useEffect(() => {
        //si se hace <- desde el navegador se cierra la conexion cuando se carga este componente pq no 
        //puedo capturar el evento cuando se hace para atrás en chatroom :(
        if (userData.connected && 
            Object.keys(stompClient.current.subscriptions).length>0) {
            // var chatMessage = {
            //     senderId:userData.userId,
            //     senderName: userData.username,
            //     urlSessionId: userData.URLSessionid,
            //     status: 'LEAVE',
            //     avatarImg: userData.avatarImg
            // }
            let leaveMessage: Message = {  
                senderId: userData.userId,
                senderName: userData.username,
                date: getActualDate(),
                status: MessagesStatus.LEAVE,
                urlSessionId: userData.URLSessionid,
                avatarImg: userData.avatarImg}
            stompClient.current.send("/app/user.disconnected", {}, JSON.stringify(leaveMessage));
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

/*
margin no me andaba
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

*/