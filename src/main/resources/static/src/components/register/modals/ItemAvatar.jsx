import { useState } from "react";
import './ModalIconChooser.css'

const ItemAvatar = ({ url,i, active,handleItemChoosed }) => {

    const handleClickAvatar = () => {
        return handleItemChoosed(url,i);
    }

    return (
        <div key={i} 
        className={`avatar ${active ? 'active' : ''}`} 
        onClick={handleClickAvatar} 
        style={{ backgroundImage: `url(${url})` }}></div>
    )
}
export default ItemAvatar;