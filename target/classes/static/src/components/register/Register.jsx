import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { userContext } from '../../context/UserDataContext';
import ModalIconChooser from './modals/item-chooser/ModalIconChooser.jsx';
import ModalJoinChat from './modals/join-chat/ModalJoinChat.jsx';

//import '../index.css'
import './Register.css'
import { useEffect } from 'react';

const Register = () => {
    const navigate = useNavigate();
    const { userData, setUserData } = useContext(userContext);


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
        if(userData.username===''){
            alert('Se debe poner un nombre de usuario!');
            return;
        }
        setShowModalJoinChat(true);
    }

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });
    }

    //esta funcion solo se ejecuta si cerras el modal, la conexion se realiza en ModalJoinChat
    const handleCloseModalJoinChat = (e,urlRoom) => {
        if (e === undefined) {
            //se hizo click en la x del modal (no hay evento creo)
            setShowModalJoinChat(false);
            return;
        }
        e.preventDefault();
        /*
        if (userData.username === '' || urlRoom === '') {
            alert('se debe poner la clave de una sala')
            return;
        }
        localStorage.setItem('username', userData.username);

        //borrar luego se debería generar un ID facha
        let urlSessionIdAux;
        setUserData({ ...userData, "URLSessionid": '1234' });
        urlSessionIdAux = '1234';
        navigate(`/chatroom/${urlSessionIdAux}`);
        */
    }

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (userData.username==='') {
            alert('se debe poner un nombre de usuario');
            return;
        }
        //se debería crear un id
        let urlRoom = '1234'
        setUserData({ ...userData, "status": 'CREATE',"URLSessionid": urlRoom });
        localStorage.setItem('username', userData.username);
        navigate(`/chatroom/${urlRoom}`);
    }

    return (
        <>
            <div className='register-container'>
                <div className="register">
                    <h1 className='register-title'>CHAT ROOM</h1>
                    <div className='register-icon-container'>
                        <div className='icon-img-contenedor' style={{ backgroundImage: `url(${localStorage.getItem('avatarImg')})` }}></div>
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
    )

}
export default Register;