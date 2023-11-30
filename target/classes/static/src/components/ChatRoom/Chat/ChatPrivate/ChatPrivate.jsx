import React, { useContext, useState } from 'react'
import Chat from "../Chat.jsx";

const ChatPrivate = ({privateChats,tab,sendPrivateValue,userData,handleMessage}) => {
    /*const [chatUserMessages,setChatUserMessages] = useState(getMessageFromUser(tab));

    const getUserSavedFromPrivateMenssage = (id) => {
        for (var obj of privateChats) {
            if(id === obj[0].id){
                return obj;
            }
          }
          return undefined;
    }

    const getMessageFromUser = (tab) => {
        if(tab === 'CHATROOM'){
            return;
        }
        let chatUser = getUserSavedFromPrivateMenssage(tab.id);
        return privateChats.get(chatUser);
    }
*/
    return (
        <div className="chat-content">
            <ul className="chat-messages">
                {(privateChats.size>0 && privateChats.get(tab)!==undefined) && privateChats.get(tab).map((chat,index)=>(
                    <Chat
                        chat={chat}
                        userData={userData}
                        index={index}
                    />
                ))}
            </ul>
        </div>
    )

}
export default ChatPrivate;

//{(privateChats.size>0 && privateChats.get(tab)!==undefined) && [...privateChats.get(tab)].map((chat,index)=>(