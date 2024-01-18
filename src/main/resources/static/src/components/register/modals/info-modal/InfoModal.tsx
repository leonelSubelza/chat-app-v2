import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

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
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{text}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>handleClose(false)}>
          {infoCloseBtn}
          </Button>
          <Button variant="primary" onClick={()=>handleClose(true)}>
            {infoAcceptBtn}
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    )
}
export default InfoModal;