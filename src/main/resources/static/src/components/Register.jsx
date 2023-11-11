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

    const handleRegisterUser=(e)=>{
        e.preventDefault();
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
                <button type="button" onClick={handleRegisterUser}>connect</button> 
            </Link>
              
        </div>
    )

}
export default Register;