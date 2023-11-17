import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import './ModalJoinChat.css'

const ModalJoinChat = ({ showModalJoinChat, handleCloseModalJoinChat }) => {

    const handleCloseModal = (e,isJoin) => {
        if(isJoin){
            return handleCloseModalJoinChat(e,'JOIN');
        }else{
            return handleCloseModalJoinChat();
        }
    }

    return (
        <Modal 
        show={showModalJoinChat} 
        onHide={(e) => handleCloseModal(e,false)} 
        centered>
            <Modal.Header closeButton>
                <Modal.Title>Join a Chat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='url-input-container'>
                    <input 
                    type='text' 
                    className='url-input' 
                    placeholder='Enter the URL or the key of the channel!' />
                    <i className="bi bi-copy url-input-icon"></i>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" className='button-join-chat' onClick={(e)=> handleCloseModal(e,true)}>
                    JOIN!!!
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
export default ModalJoinChat;