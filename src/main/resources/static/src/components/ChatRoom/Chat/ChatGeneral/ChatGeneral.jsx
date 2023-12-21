import React, { useContext, useEffect } from 'react'
import Chat from "../Chat.jsx";
import { userContext } from '../../../../context/UserDataContext.jsx';
import { v4 as uuidv4 } from 'uuid';

const ChatGeneral = () => {
    const { userData,publicChats,chats,tab } = useContext(userContext);
/*
    useEffect(()=>{
        console.log("--------------------------------");
        console.log("se renderizan los msj, tab seleccionado: ");
        console.log(tab);
        console.log("Se deberían renderizar los mensajes?: "+(chats.size > 0 && chats.get(tab) !== undefined)+", mensajes: ");
        console.log(chats.get(tab));
        console.log("los chats: ");
        console.log(chats);
        console.log("--------------------------------");
    })
*/
    return (
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {(chats.size > 0 && chats.get(tab) !== undefined) && 
                    chats.get(tab).map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                            isPublicChat={chat.username==='CHATROOM'}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )

}
export default ChatGeneral;
/*
        <div className="chat-content">
            <div className='scroll-messages'>
                <ul className="chat-messages">
                    {publicChats.map((chat) => (
                        <Chat
                            key={uuidv4()}
                            chat={chat}
                            userData={userData}
                            isPublicChat={true}
                        />
                    ))}
                </ul>
            </div>
        </div>
*/