import './ModalIconChooser.css'

interface Props {
    url:string;
    i:number;
    handleItemChoosed:(url:string,i:number)=>void;
}

const ItemAvatar = ({ url,i,handleItemChoosed }:Props) => {
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