import { UserData, UserDataContextType } from "../../context/types/types";
import { getActualDate } from "../../utils/MessageDateConvertor";
import { ChatUserRole, UserChat } from "../interfaces/chatRoom.types";
import { Message } from "../interfaces/messages";
import { MessagesStatus } from "../interfaces/messages.status";

export const resetValues = (userDataContext: UserDataContextType) => {
  const {
    userData,
    setUserData,
    setChannelExists,
    resetChats
  } = userDataContext;

  setChannelExists(false);
  resetChats();
  setUserData({
    ...userData,
    message: "",
    urlSessionid: "",
    status: MessagesStatus.JOIN,
    chatRole: ChatUserRole.CLIENT
  });
};

const updateMessage = (actualMessage: Message, newMsg: Message) => {
  actualMessage.senderName = newMsg.senderName;
  actualMessage.avatarImg = newMsg.avatarImg;
}

//Actualiza en el obj chatroom todos sus mjs y la key
const updateUserChatDataPublic = (userDataContext: UserDataContextType, message: Message) => {
  const { chats, setChats } = userDataContext;
  let chatRoomElement: UserChat = Array.from(chats.keys())[0];
  let chatsPublics: Message[] = chats.get(chatRoomElement);
  if(chatsPublics===undefined||chatsPublics.length===0){
    return;
  }
  //aca public chats da undefined y nose por qué
  chatsPublics.forEach((element) => {
    if (message.senderId === element.senderId) {
      updateMessage(element,message)
    }
  });
  chats.set(chatRoomElement,chatsPublics)
  //setChats([...chatsPublics]);
  setChats(new Map(chats));
};

//Act el userChat correspondiente con todos sus mjs y su key
const updateUserChatDataPrivate = (
  userDataContext: UserDataContextType, message: Message, userChat: UserChat) => {
  const { chats, setChats } = userDataContext;
  let userMessages: Message[] = chats.get(userChat);
  if (chats.get(userChat) === undefined) {
    return;
  }
  userMessages.forEach((currentMsg) => updateMessage(currentMsg,message));
  
  //Actualizamos la key que tiene los datos del usuario a act (lo que se ve en el sidebar)
  for (let user of chats.keys()) {
    if (user.id === message.senderId) {
      user.username = message.senderName;
      user.avatarImg = message.avatarImg;
    }
  }
  chats.set(userChat,userMessages);
  setChats(new Map(chats));
};

export const updateChatData = (message: Message, userDataContext: UserDataContextType, userChat: UserChat) => {
  updateUserChatDataPublic(userDataContext, message);
  updateUserChatDataPrivate(userDataContext, message, userChat);
};

////////////////////////////////////////////////////////////////////////////////////////////////

export const createUserChat = (message: Message): UserChat => {
  return {
    id: message.senderId,
    username: message.senderName,
    joinDate: message.date,
    avatarImg: message.avatarImg,
    hasUnreadedMessages:false,
    chatRole: message.chatRole
  };
};

export const createPublicMessage = (status: MessagesStatus, userData: UserData): Message => {
  return {
    senderId: userData.id,
    senderName: userData.username,
    date: getActualDate(),
    message: userData.message,
    status: status,
    urlSessionId: userData.urlSessionid,
    avatarImg: userData.avatarImg,
    chatRole: userData.chatRole
  };
};

export const createPrivateMessage = (
  status: MessagesStatus,
  userData: UserData,
  receiverName: string,
  receiverId: string
): Message => {
  return {
    senderId: userData.id,
    senderName: userData.username,
    receiverName: receiverName,
    receiverId: receiverId,
    date: getActualDate(),
    message: userData.message,
    status: status,
    urlSessionId: userData.urlSessionid,
    avatarImg: userData.avatarImg,
    chatRole: userData.chatRole
  };
};

//Crea un msj de que se unió alguien
export const createMessageJoin = (status: MessagesStatus, message: Message): Message => {
  return {
    senderId: message.senderId,
    senderName: message.senderName,
    urlSessionId:message.urlSessionId,
    date: getActualDate(),
    status: status,
    avatarImg: message.avatarImg,
    chatRole: message.chatRole
  };
};
