import { getActualDate } from "../../utils/MessageDateConvertor";

export const resetValues = (userDataContext) => {
  const {
    setIsDataLoading,
    userData,
    setUserData,
    startedConnection,
    setPrivateChats,
    setPublicChats,
    setTab,
    stompClient,
    setChannelExists,
  } = userDataContext;

  //setIsDataLoading(true);
  startedConnection.current = false;
  setChannelExists(false);
  if (stompClient !== null) {
    stompClient.current = null;
  }
  setPrivateChats(new Map());
  setPublicChats([]);
  setTab("CHATROOM");
  setUserData({
    ...userData,
    connected: false,
    receivername: "",
    message: "",
    URLSessionid: "",
    status: "JOIN",
  });
  //localStorage.setItem('connected',false)
};

export const disconnectChat = (userDataContext) => {
  const { stompClient } = userDataContext;
  if (stompClient.current !== null) {
    stompClient.current.disconnect();
    //navigate("/");
    resetValues(userDataContext);
  }
};

//Actualizar foto y nombre de un chatUser

export const updateChatData = (payloadData, userDataContext, userChat) => {
  /*
  const {publicChats} = userDataContext;
  let msgPublic = publicChats.find(msg => msg.senderId === payloadData.senderId);
  if(msgPublic !== undefined){
    if(msgPublic.senderName!==payloadData.senderName || msgPublic.avatarImg !== payloadData.avatarImg){
      updateUserChatDataPublic(userDataContext,payloadData);
    }
  }
  if(userChat.senderName!==payloadData.senderName || userChat.avatarImg !== payloadData.avatarImg){
    updateUserChatDataPrivate(userDataContext,payloadData,userChat);
  }
  */
  updateUserChatDataPublic(userDataContext, payloadData);
  updateUserChatDataPrivate(userDataContext, payloadData, userChat);
};

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
////////////////////////////////////////////////////////////////////////////////////////////////

export const createUserChat = (payloadData) => {
  return {
    id: payloadData.senderId,
    username: payloadData.senderName,
    joinData: payloadData.date,
    avatarImg: payloadData.avatarImg,
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
