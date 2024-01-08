import React, { useState,useContext, useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ModalJoinChat.css'
import { isCorrectURL } from '../../../../utils/InputValidator';
import {userContext} from '../../../../context/UserDataContext.tsx';
import { chatRoomConnectionContext } from '../../../../context/ChatRoomConnectionContext.jsx';
const ModalJoinChat = ({ showModalJoinChat, handleCloseModalJoinChat }) => {

    const [inputValue, setInputValue] = useState('');
    const { userData,setUserData } = useContext(userContext);
    const {checkIfChannelExists} = useContext(chatRoomConnectionContext)

    const handleCloseModal = (e) => {
        if(e===undefined){
            closeModal(e);
            return;
        }
        if (inputValue === '') {
            alert('Debe escribir un link para unirse a una sala!');
            return;
        }
        if(localStorage.getItem('username')===null || localStorage.getItem('username')===''
        || userData.username === ''){
            alert('Debe escribir un nombre de usuario!');
            return;
        }
        if(localStorage.getItem('avatarImg')===null || localStorage.getItem('avatarImg')===''
        || userData.avatarImg === ''){
            alert('Debe seleccionar una imagen!');
            return;
        }

        if(isCorrectURL(inputValue)){
            console.log("el link escrito es un link valido");

            const domain = window.location.origin;
            let urlSessionIdAux = inputValue.split(domain+'/chatroom/')[1];
            setUserData({...userData,"URLSessionid": urlSessionIdAux});
            //navigate(`/chatroom/${urlSessionIdAux}`);
            window.removeEventListener('keyup', handleKeyPressed);
            setInputValue('');
            checkIfChannelExists(urlSessionIdAux);
        }else{
            //si el link escrito no es una url válida, entonces se verifica que sea solo una contraseña
            if( /^[a-zA-Z\d]+$/.test(inputValue)){
                console.log("el link escrito es una contraseña valida");
                setUserData({...userData,"URLSessionid": inputValue});
                //navigate(`/chatroom/${inputValue}`);
                window.removeEventListener('keyup', handleKeyPressed);
                setInputValue('');
                checkIfChannelExists(inputValue);
            }else{
                alert("el link escrito NO es una contraseña valida")
            }
        }

        //return handleCloseModalJoinChat(e,inputValue);
    }

    const closeModal = (e) => {
        setInputValue('');
        window.removeEventListener('keyup', handleKeyPressed);
        return handleCloseModalJoinChat(e);
    }

    const copyInput = () => {
        navigator.clipboard.writeText(inputValue)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Error in copying text: ', err);
        });
    }

    const handleKeyPressed = (e) => {
        let key = e;
        if (typeof e !== 'string') {
            key = e.key;
        }
        if(key === 'Enter'){
            console.log("se pulsó enter en ModalJoinChat");
            handleCloseModal(e);
        }
    }

    useEffect(()=>{
        if(showModalJoinChat){
            window.addEventListener('keyup', handleKeyPressed);
        }
        return () => {
            window.removeEventListener('keyup', handleKeyPressed);
        }
    })


    return (
        <Modal
            show={showModalJoinChat}
            onHide={(e)=>handleCloseModal(e)}
            centered>
            <Modal.Header closeButton>
                <Modal.Title>Join a Chat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='url-input-container'>
                    <input
                        type='text'
                        className='url-input'
                        placeholder='Enter the URL or the key of the channel!'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)} 
                        autoFocus/>
                    <i className="bi bi-copy url-input-icon" onClick={copyInput}></i>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" className='button-join-chat' onClick={handleCloseModal}>
                    JOIN!!!
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
export default ModalJoinChat;
