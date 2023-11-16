import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../Register.css';
import './ModalIconChooser.css';
import {imageLinks} from '../../../services/avatarsLinks.js';
import { useState } from 'react';
import ItemAvatar from './ItemAvatar.jsx';

const ModalIconChooser = ({show, handleClose}) => {

    const [iconChoosed, setIconChoosed] = useState(localStorage.getItem('avatarImg'));
    const [itemActiveIndex, setItemActiveIndex] = useState(null);

    const handleItemChoosed = (urlIcon,index) => {
      setItemActiveIndex(index)
      setIconChoosed(urlIcon);
    }

    const handleConfirmItemChoosed = () => {
      localStorage.setItem('avatarImg',iconChoosed)
      return handleClose(iconChoosed);
    }

    return(
        <Modal show={show} >
        <Modal.Header closeButton>
          <Modal.Title>Choose Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='list-chooser-container'>
            <div className='scroll'>
                <ul>
                  {imageLinks.map( (url,i)=> (
                    <li><ItemAvatar url={url} i={i} active={i===itemActiveIndex} handleItemChoosed={handleItemChoosed} /></li>
                  ))
                  }
                  
                </ul>
            </div>
          </div>


        </Modal.Body>
        <Modal.Footer>
          <button className='button button-chooser' onClick={handleConfirmItemChoosed}>
            Confirm
          </button>
        </Modal.Footer>
      </Modal>
    );
};
export default ModalIconChooser;