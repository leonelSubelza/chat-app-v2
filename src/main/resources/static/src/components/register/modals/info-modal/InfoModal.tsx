import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './InfoModal.css';

interface Props {
  title: string;
  text: string;
  show: boolean;
  infoCloseBtn:string;
  infoAcceptBtn:string;
  //retorna true si la resp fue ok, y false si no
  handleCloseInfoModal:(resp:boolean)=>void;
}

const InfoModal = ({title, text, show, infoCloseBtn, infoAcceptBtn,handleCloseInfoModal}:Props) => {
    
  const handleClose = (resp:boolean) => {
      return handleCloseInfoModal(resp);
    };

    return (
        <>
      <Modal show={show} onHide={()=>handleClose(false)} animation={true} centered size='sm'>
        <Modal.Body>{text}</Modal.Body>
        <Modal.Footer className='footer-info-modal'>
          <button onClick={()=>handleClose(false)} className='button-info-modal btn-cancel'>
          {infoCloseBtn}
          </button>
          <button onClick={()=>handleClose(true)} className='button-info-modal'>
            {infoAcceptBtn}
          </button>
        </Modal.Footer>
      </Modal>
      </>
    )
}
export default InfoModal;