import { getActualDate } from "../../utils/MessageDateConvertor";

export const resetValues = (userDataContext) => {
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
    URLSessionid: "",
    status: "JOIN",
  });
};

const updateMessage = (msg,payloadData) => {
  msg.senderName = payloadData.username;
  msg.avatarImg = payloadData.avatarImg;
}

const updateUserChatDataPublic = (userDataContext, payloadData) => {
  const { chats, setChats } = userDataContext;
  let chatRoomElement = Array.from(chats.keys())[0];
  let chatsPublics = chats.get(chatRoomElement);
  if(chatsPublics===undefined||chatsPublics.length===0){
    return;
  }
  //aca public chats da undefined y nose por qué
  chatsPublics.forEach((element) => {
    if (payloadData.id === element.id) {
      updateMessage(element,payloadData)
    }
  });
  setChats([...chatsPublics]);
};

const updateUserChatDataPrivate = (userDataContext, payloadData, userChat) => {
  const { chats, setChats } = userDataContext;
  if (chats.get(userChat) === undefined) {
    return;
  }
  chats.get(userChat).forEach((msg) => updateMessage(msg,payloadData));
  
  //Actualizamos las keys que tienen los datos de los usuarios (lo que se ve en el sidebar)
  for (let user of chats.keys()) {
    if (user.id === payloadData.senderId) {
      user.username = payloadData.senderName;
      user.avatarImg = payloadData.avatarImg;
    }
  }
  setChats(new Map(chats));
};

export const updateChatData = (payloadData, userDataContext, userChat) => {
  updateUserChatDataPublic(userDataContext, payloadData);
  updateUserChatDataPrivate(userDataContext, payloadData, userChat);
};

////////////////////////////////////////////////////////////////////////////////////////////////

export const createUserChat = (payloadData) => {
  return {
    id: payloadData.senderId,
    username: payloadData.senderName,
    joinData: payloadData.date,
    avatarImg: payloadData.avatarImg,
    hasUnreadedMessages:false
  };
};

export const createPublicMessage = (status, userData) => {
  return {
    senderId: userData.userId,
    senderName: userData.username,
    date: getActualDate(),
    message: userData.message,
    status: status,
    urlSessionId: userData.URLSessionid,
    avatarImg: userData.avatarImg,
  };
};

export const createPrivateMessage = (
  status,
  userData,
  receiverName,
  receiverId
) => {
  return {
    senderId: userData.userId,
    senderName: userData.username,
    receiverName: receiverName,
    receiverId: receiverId,
    date: getActualDate(),
    message: userData.message,
    status: status,
    urlSessionId: userData.URLSessionid,
    avatarImg: userData.avatarImg,
  };
};

export const createMessageJoin = (status, payloadData) => {
  return {
    senderId: payloadData.senderId,
    senderName: payloadData.senderName,
    urlSessionId:payloadData.urlSessionId,
    date: getActualDate(),
    status: status,
    avatarImg: payloadData.avatarImg
  };
};
