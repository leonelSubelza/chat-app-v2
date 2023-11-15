import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../Register.css';
import './ModalIconChooser.css';

const ModalIconChooser = ({show, handleClose}) => {
    return(
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
          </ul>

        </Modal.Body>
        <Modal.Footer>
          <button className='button button-chooser' onClick={handleClose}>
            Confirm
          </button>
        </Modal.Footer>
      </Modal>
    );
};
export default ModalIconChooser;