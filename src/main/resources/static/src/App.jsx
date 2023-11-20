import React, { useState,useEffect,useContext } from 'react'

import ChatRoom from "./components/ChatRoom/ChatRoom.jsx";
import Register from "./components/Register";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { userContext } from './context/UserDataContext';

function App() {
  const { userData } = useContext(userContext);
  return (
    <>
    <Router>
        <Routes>
          <Route path="/" element={<Register/>} />
          <Route path={`/chatroom/*`} element={<ChatRoom />} />
          <Route path='*' element={<Register/>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

/*
    <UserDataContext>
      <div>
        HOLA
      <Router>
        <Routes>
          <Route path="/" element={<Register/>} />
          <Route path="/chatroom" element={<ChatRoom />} />
          <Route path="*" element={<Register/>} />
        </Routes>
      </Router>
      </div>
    </UserDataContext>

*/