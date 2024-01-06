import { useState } from "react";
import './ModalIconChooser.css'

const ItemAvatar = ({ url,i,handleItemChoosed }) => {

    const handleClickAvatar = () => {
        return handleItemChoosed(url,i);
    }

    return (
        <div key={i} 
        className={`avatar-icon-chooser`}
        onClick={handleClickAvatar} 
        style={{ backgroundImage: `url(${url})` }}></div>
    )
}
export default ItemAvatar;