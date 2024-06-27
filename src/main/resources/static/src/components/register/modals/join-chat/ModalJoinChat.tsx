import React, { useState,useContext, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal';
import './ModalJoinChat.css'
import {copyInputSuccessful, isCorrectURL} from '../../../../utils/InputFunctions.ts';
import {userContext} from '../../../../context/UserDataContext.tsx';
import { chatRoomConnectionContext } from '../../../../context/ChatRoomConnectionContext.tsx';
import { webSiteChatURL, maxMessageLength } from '../../../../config/chatConfiguration.ts'
import {toast, Toaster} from "sonner";

interface Props {
    showModalJoinChat: boolean;
    handleCloseModalJoinChat: ()=>void;
}

const ModalJoinChat = ({ showModalJoinChat, handleCloseModalJoinChat }: Props) => {

    const [inputValue, setInputValue] = useState<string>('');
    const { userData,setUserData } = useContext(userContext);
    const {checkIfChannelExists} = useContext(chatRoomConnectionContext)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if(value.length>maxMessageLength){
          console.log("la cant de caracteres es mayor a 255");
          return;
        }
        setInputValue(value);
    }

    const handleCloseModal = () => {
        // if(e===undefined){
        //     closeModal(e);
        //     return;
        // }
        if (inputValue === '') {
            // alert('Debe escribir un link para unirse a una sala!');
            toast.error("You must write a link to join a room!")
            return;
        }
        if(userData.username === ''){
            alert('Debe escribir un nombre de usuario!');
            return;
        }
        if(userData.avatarImg === ''){
            alert('Debe seleccionar una imagen!');
            return;
        }
        if(isCorrectURL(inputValue)){
            console.log("el link escrito es un link valido");

            const domain = window.location.origin;
            let urlSessionIdAux = inputValue.split(domain+webSiteChatURL)[1];
            userData.urlSessionid = urlSessionIdAux;
            setUserData({...userData,"urlSessionid": urlSessionIdAux});
            //navigate(`/chatroom/${urlSessionIdAux}`);
            window.removeEventListener('keyup', handleKeyPressed);
            checkIfChannelExists();
        }else{
            let inputValueAux = inputValue.toUpperCase();
            //si el link escrito no es una url válida, entonces se verifica que sea solo una contraseña
            if( /^[a-zA-Z\d]+$/.test(inputValueAux)){
                console.log("el link escrito es una contraseña valida");
                userData.urlSessionid = inputValueAux;
                setUserData({...userData,"urlSessionid": inputValueAux});
                //navigate(`/chatroom/${inputValue}`);
                window.removeEventListener('keyup', handleKeyPressed);
                checkIfChannelExists();
            }else{
                alert("el link escrito NO es una contraseña valida")
            }
        }

        //return handleCloseModalJoinChat(e,inputValue);
    }

    const closeModal = () => {
        setInputValue('');
        window.removeEventListener('keyup', handleKeyPressed);
        return handleCloseModalJoinChat();
    }

    const showSonnerMessage = () => {
        toast.info("URL Copied to clipboard!",{
            style: {
                background: '#383258',
                color: "#fff",
                border: '1px solid #383258'
            },
            className: 'class',
        });
    }

    const copyInput = (): void => {
        if(inputValue === '') {
            toast.error("No text to copy")
            return;
        }
        if(copyInputSuccessful(inputValue))  {
            showSonnerMessage();
        }
    };

    const handleKeyPressed = (e:KeyboardEvent|string) => {
        let key = e;
        if (typeof e !== 'string') {
            key = e.key;
        }
        if(key === 'Enter'){
            handleCloseModal();
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
            onHide={closeModal}
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
                        onChange={handleInputChange} 
                        autoFocus/>
                    <i className="bi bi-copy url-input-icon" onClick={copyInput}></i>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <button className='button-join-chat' onClick={handleCloseModal}>
                    JOIN!!!
                </button>
            </Modal.Footer>
            <Toaster richColors position="bottom-center"/>
        </Modal>
    );
}
export default ModalJoinChat;
