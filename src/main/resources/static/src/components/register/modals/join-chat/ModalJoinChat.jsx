import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import './ModalJoinChat.css'
import { useState } from 'react';

const ModalJoinChat = ({ showModalJoinChat, handleCloseModalJoinChat }) => {

    const [inputValue, setInputValue] = useState('');

    const handleCloseModal = (e) => {
        if(e===undefined){
            handleCloseModalJoinChat(e);
            return;
        }
        if (inputValue === '') {
            alert('Debe escribir un link para unirse a una sala!');
            return;
        }
        return handleCloseModalJoinChat(e,inputValue);
    }

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
                        onChange={(e) => setInputValue(e.target.value)} />
                    <i className="bi bi-copy url-input-icon"></i>
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
