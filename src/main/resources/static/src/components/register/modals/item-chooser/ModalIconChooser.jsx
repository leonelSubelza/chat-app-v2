import Modal from 'react-bootstrap/Modal';
import { v4 as uuidv4 } from 'uuid';
import '../../Register.css';
import './ModalIconChooser.css';
import { imageLinks } from '../../../../services/avatarsLinks.js';
import { useState } from 'react';
import ItemAvatar from './ItemAvatar.jsx';

const ModalIconChooser = ({ showModalIconChooser, handleCloseModalIconChooser }) => {

  const [iconPrevChoosed, setIconPrevChoosed] = useState(localStorage.getItem('avatarImg'));
  const [iconChoosed, setIconChoosed] = useState(localStorage.getItem('avatarImg'));
  const [itemActiveIndex, setItemActiveIndex] = useState(null);

  const handleItemChoosed = (urlIcon, index) => {
    setItemActiveIndex(index)
    setIconChoosed(urlIcon);
  }

  const handleConfirmItemChoosed = (isConfirmButton) => {
    if(isConfirmButton){
      localStorage.setItem('avatarImg', iconChoosed)
      return handleCloseModalIconChooser(iconChoosed);
    }else{
      return handleCloseModalIconChooser(iconPrevChoosed);
    }
    
  }

  return (
    <Modal show={showModalIconChooser} 
           onHide={()=> handleConfirmItemChoosed(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Choose Avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='list-chooser-container'>
          <div className='scroll'>
            <ul>
              {imageLinks.map((url,i=uuidv4()) => (
                <li
                  key={i}
                  className={`list-item-item ${
                    itemActiveIndex===null ? 
                    (iconChoosed===url ? 'item-active' : '') :
                    (i === itemActiveIndex ? 'item-active' : '')}`}
                  onClick={() => { setItemActiveIndex(i) }}
                >
                  <ItemAvatar url={url} i={i} handleItemChoosed={handleItemChoosed} />
                </li>
              ))
              }
            </ul>
          </div>
        </div>


      </Modal.Body>
      <Modal.Footer>
        <button className='button button-chooser' onClick={()=>handleConfirmItemChoosed(true)}>
          Confirm
        </button>
      </Modal.Footer>
    </Modal>
  );
};
export default ModalIconChooser;