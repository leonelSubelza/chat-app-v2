import React from 'react'
import ChatRoom from "./components/ChatRoom/ChatRoom.jsx";
import Register from "./components/register/Register.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChatRoomConnectionContext } from './context/ChatRoomConnectionContext.jsx';

function App() {
  return (
      <Router>
        <ChatRoomConnectionContext>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path={`/chatroom/*`} element={<ChatRoom />} />
            <Route path='*' element={<Register />} />
          </Routes>
          </ChatRoomConnectionContext>
      </Router>
  );
}

export default App;