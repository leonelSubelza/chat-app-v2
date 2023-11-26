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