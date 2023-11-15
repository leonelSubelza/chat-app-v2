import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../Register.css';
import './ModalIconChooser.css';
import {imageLinks} from '../../../services/avatarsLinks.js';

const ModalIconChooser = ({show, handleClose}) => {
    return(
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='list-chooser-container'>
            <div className='scroll'>
                <ul>
                  {imageLinks.map( (url,i)=> (
                    <li><div key={i} className='avatar' style={{ backgroundImage: `url(${url})`}}></div></li>
                  ))
                  }
                  
                </ul>
            </div>
          </div>


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