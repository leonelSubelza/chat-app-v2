import { useUserDataContext } from "../../context/UserDataContext"; 

export const resetValues = () => {
    const {setIsDataLoading, userData, setUserData, startedConnection, privateChats, setPrivateChats,
       setPublicChats, setTab,stompClient} = useUserDataContext();

    setIsDataLoading(true);
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
    });
  };
  
export const disconnectChat = () => {
    const {userData, stompClient, setStompClient} = useUserDataContext();
    userData.connected = false;
    if (stompClient.current !== null) {
      stompClient.current.disconnect();
      navigate("/");
    }
    setStompClient(null);
    resetValues();
  };