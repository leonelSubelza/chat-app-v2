import Modal from 'react-bootstrap/Modal';
import { v4 as uuidv4 } from 'uuid';
import '../../Register.css';
import './ModalIconChooser.css';
import { useContext, useState } from 'react';
import ItemAvatar from './ItemAvatar.tsx';
import { userContext } from '../../../../context/UserDataContext.tsx';
import { UserDataContextType, UserDataSaveLocalStorage } from '../../../../context/types/types.ts';

interface Props {
  showModalIconChooser: boolean; 
  handleCloseModalIconChooser:(iconChoosed:string)=>void;
}

const ModalIconChooser = ({ showModalIconChooser, handleCloseModalIconChooser }:Props) => {
  const { imageLinks } = useContext(userContext) as UserDataContextType;

  //El valor avatarImg se supone que ya se cargó en el context UserDataContext osea que no es null
  const [iconPrevChoosed] = useState<string>(localStorage.getItem('avatarImg'));
  const [iconChoosed, setIconChoosed] = useState<string>(JSON.parse(localStorage.getItem('userData')).avatarImg);

  const [itemActiveIndex, setItemActiveIndex] = useState<number>(null);

  const handleItemChoosed = (urlIcon:string, index: number) => {
    setItemActiveIndex(index);
    setIconChoosed(urlIcon);
  }

  const handleConfirmItemChoosed = (isConfirmButton: boolean) => {
    if(isConfirmButton) {
      let userDataStorage: UserDataSaveLocalStorage = JSON.parse(localStorage.getItem('userData'));
      userDataStorage.avatarImg = iconChoosed;
      localStorage.setItem('userData', JSON.stringify(userDataStorage))
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
              {imageLinks.map((url:string,i:number = Number(uuidv4())) => (
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