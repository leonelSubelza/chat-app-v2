import React, { useContext,useState } from 'react'
import { Link,useNavigate } from 'react-router-dom';

import { userContext } from '../../context/UserDataContext';
import ModalIconChooser from './modals/ModalIconChooser.jsx';
//import '../index.css'
import './Register.css'

const Register = () => {
    const navigate = useNavigate();
    const { userData,setUserData } = useContext(userContext);


    //MOdal icon chooser
    const [show, setShow] = useState(false);

    const handleClose = (iconChoosed) => {
        setShow(false)
        setUserData({...userData,"avatarImg": iconChoosed});
    };
    const handleShow = () => setShow(true);


    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const handleJoinChat=(e,status)=>{
        e.preventDefault();
        if( (userData.username==='' || userData.URLSessionid==='')&&status!=='CREATE'){
            alert('se debe poner un nombre de usuario o poner una la clave de una sala')
            return;
        }
        //borrar luego
        let urlSessionIdAux;
        if(status==='CREATE'){
            setUserData({...userData,"URLSessionid": 'pene'});    
            urlSessionIdAux='pene';
        }
        
        setUserData({...userData,"status": status});
        localStorage.setItem('username',userData.username);
        navigate(`/chatroom/${urlSessionIdAux}`);
    }

    useContext(() => {
        console.log("se actualiza el componente Register");
    })

    return (
        <>
            <div className='register-container'>
                <div className="register">
                    <h1 className='register-title'>CHAT ROOM</h1>
                    <div className='register-icon-container'>
                        <div className='icon-img-contenedor' style={{ backgroundImage: `url(${localStorage.getItem('avatarImg')})`}}></div>
                        <button className='icon-edit-btn' onClick={handleShow}><i className="bi bi-pencil"></i></button>
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
                        {/* 
                        <Link to={`/chatroom/${userData.URLSessionid}`}>
                            <button type="button" className='button btn-join-chat' onClick={(e)=>handleJoinChat(e,"JOIN")}>JOIN A CHAT</button> 
                        </Link>
                        <Link to={`/chatroom/${userData.URLSessionid}`}>
                            <button type="button" className='button btn-create-room' onClick={(e)=>handleJoinChat(e,"CREATE")}>CREATE A ROOM</button>
                        </Link>
                        */}
                        <button type="button" className='button btn-join-chat' onClick={(e)=>handleJoinChat(e,"JOIN")}>
                            <i className="bi bi-box-arrow-in-right"></i>JOIN A CHAT
                        </button> 
                        <button type="button" className='button btn-create-room' onClick={(e)=>handleJoinChat(e,"CREATE")}>
                            <i className="bi bi-pencil-square"></i>CREATE A ROOM
                            </button>
                        </div>
                </div>
            </div>
            <ModalIconChooser show={show} handleClose={handleClose}/>
        </>
    )

}
export default Register;