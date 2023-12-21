import { getActualDate } from "../../utils/MessageDateConvertor";

export const resetValues = (userDataContext) => {
  const {
    userData,
    setUserData,
    //startedConnection,
    setPrivateChats,
    setPublicChats,
    setTab,
    stompClient,
    setChannelExists,
    resetChats
  } = userDataContext;

  //setIsDataLoading(true);
  //startedConnection.current = false;

//startedConnection.current && !isDataLoading && userData.connected


  setChannelExists(false);
  //if (stompClient !== null) {
  //  stompClient.current = null;
  //}
  setPrivateChats(new Map());
  setPublicChats([]);

  resetChats();

  setTab();
  setUserData({
    ...userData,
    receivername: "",
    message: "",
    URLSessionid: "",
    status: "JOIN",
  });
  //localStorage.setItem('connected',false)
};

export const updateChatData = (payloadData, userDataContext, userChat) => {
  updateUserChatDataPublic(userDataContext, payloadData);
  updateUserChatDataPrivate(userDataContext, payloadData, userChat);
};


/*
const updateUserChatDataPublic = (userDataContext, payloadData) => {
  const { publicChats, setPublicChats } = userDataContext;
  if(publicChats===undefined||publicChats.length===0){
    return;
  }
  //aca public chats de undefined y nose por qué
  publicChats.forEach((element) => {
    if (payloadData.id === element.id) {
      element.username = payloadData.username;
      element.avatarImg = payloadData.avatarImg;
    }
  });
  setPublicChats([...publicChats]);
};

const updateUserChatDataPrivate = (userDataContext, payloadData, userChat) => {
  const { privateChats, setPrivateChats } = userDataContext;
  if (privateChats.get(userChat) === undefined) {
    return;
  }
  privateChats.get(userChat).forEach((msg) => {
    msg.senderName = payloadData.username;
    msg.avatarImg = payloadData.avatarImg;
  });
  for (let user of privateChats.keys()) {
    if (user.id === payloadData.senderId) {
      user.username = payloadData.senderName;
      user.avatarImg = payloadData.avatarImg;
    }
  }
  setPrivateChats(new Map(privateChats));
};
*/

const getPrimerElementoDelMap = (chats) =>{
  for (var obj of chats) {
      return obj[0];
  }
}

const updateUserChatDataPublic = (userDataContext, payloadData) => {
  const { chats, setChats } = userDataContext;
  let chatRoomElement = Array.from(chats.keys())[0];
  let chatsPublics = chats.get(chatRoomElement);
  if(chatsPublics===undefined||chatsPublics.length===0){
    return;
  }
  //aca public chats de undefined y nose por qué
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
  
  //Actualizamos las keys que tienen los datos de los usuarios
  for (let user of chats.keys()) {
    if (user.id === payloadData.senderId) {
      user.username = payloadData.senderName;
      user.avatarImg = payloadData.avatarImg;
    }
  }
  setChats(new Map(chats));
};

const updateMessage = (msg,payloadData) => {
  msg.senderName = payloadData.username;
  msg.avatarImg = payloadData.avatarImg;
}
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
    date: getActualDate(),
    status: status,
    avatarImg: payloadData.avatarImg
  };
};

/*
  MSJ PRIVADO
                  senderId:userData.userId,
                senderName: userData.username,
                receiverName: tab,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid,
                avatarImg: userData.avatarImg
  
  MSJ JOIN
              senderId:userIdAux,
            senderName: userData.username,
            urlSessionId: urlSessionIdAux,
            status: userData.status,
            avatarImg: userData.avatarImg

  MSJ JOIN-RESEND
                      senderId:userIdAux,
                    senderName: userData.username,
                    receiverName: payloadData.senderName,
                    urlSessionId: roomId,
                    status: "JOIN",
                    avatarImg: userData.avatarImg

  MSJ PUBLICO
                  senderId:userData.userId,
                senderName: userData.username,
                date: getActualDate(),
                message: userData.message,
                status: "MESSAGE",
                urlSessionId: userData.URLSessionid,
                avatarImg: userData.avatarImg

  
  ACLARACIÓN: MSJ PÚBLICO Y MSJ JOIN FUERON UNIFICADOS Y MSJ JOIN-RESEND Y PRIVATE MSJ TAMBIÉN
  */
