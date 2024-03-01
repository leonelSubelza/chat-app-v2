import ChatRoom from "./components/ChatRoom/ChatRoom.tsx";
import Register from "./components/register/Register.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChatRoomConnectionContext } from './context/ChatRoomConnectionContext.tsx';

function App() {
  return (
      <Router>
        <ChatRoomConnectionContext>
          <Routes>
            <Route path="/" element={<Register />}/>
            <Route path={`chat-app-v2/chatroom/*`} element={<ChatRoom />} />
            <Route path='*' element={<Register />} />
          </Routes>
          </ChatRoomConnectionContext>
      </Router>
  );
}

export default App;