import { getActualDate } from "../../utils/MessageDateConvertor";

export const resetValues = (userDataContext) => {
    const {setIsDataLoading, userData, setUserData, startedConnection, setPrivateChats,
       setPublicChats, setTab,stompClient,setChannelExists} = userDataContext;

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
      URLSessionid:'',
      status:'JOIN'
    });
  };
  
export const disconnectChat = (userDataContext) => {
    const {stompClient} = userDataContext;
    if (stompClient.current !== null) {
      stompClient.current.disconnect();
      //navigate("/");
      resetValues(userDataContext);
    }
  };

  export const createUserChat = (payloadData)=>{
    return {
      id:payloadData.senderId,
      username:payloadData.senderName,
      joinData:payloadData.date,
      avatarImg: payloadData.avatarImg 
    };
  }

  export const createPublicMessage = (status,userData) => {
    return {
      senderId:userData.userId,
      senderName: userData.username,
      date: getActualDate(),
      message: userData.message,
      status: status,
      urlSessionId: userData.URLSessionid,
      avatarImg: userData.avatarImg
    }
  }

  export const createPrivateMessage = (status,userData,receiverName,receiverId) => {
    return {
      senderId:userData.userId,
      senderName: userData.username,
      receiverName: receiverName,
      receiverId:receiverId,
      date: getActualDate(),
      message: userData.message,
      status: status,
      urlSessionId: userData.URLSessionid,
      avatarImg: userData.avatarImg
    }
  }
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