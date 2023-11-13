import React, { useContext } from 'react'
import { Link,useNavigate } from 'react-router-dom';

import { userContext } from '../context/UserDataContext';
import '../index.css'

const Register = () => {
    const navigate = useNavigate();
    const { userData,setUserData } = useContext(userContext);

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const handleJoinChat=(e,status)=>{
        e.preventDefault();
        if(userData.username==='' || userData.URLSessionid===''){
            alert('se debe poner un nombre de usuario o poner una la clave de una sala')
            return;
        }
        setUserData({...userData,"status": status});
        localStorage.setItem('username',userData.username);
        navigate(`/chatroom/${userData.URLSessionid}`);
    }



    return (
        <div className="register">
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
            />
            <Link to={`/chatroom/${userData.URLSessionid}`}>
                <button type="button" onClick={(e)=>handleJoinChat(e,"JOIN")}>Connect a chat</button> 
            </Link>
            <Link to={`/chatroom/${userData.URLSessionid}`}>
                <button type="button" onClick={(e)=>handleJoinChat(e,"CREATE")}>Create Room</button> 
            </Link>
              
        </div>
    )

}
export default Register;