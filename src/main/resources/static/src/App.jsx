import React, { useState,useEffect,useContext } from 'react'

import ChatRoom from "./components/ChatRoom";
import Register from "./components/register/Register";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { userContext } from './context/UserDataContext';

function App() {
  const { userData } = useContext(userContext);
  return (
    <div className='container'>
    <Router>
        <Routes>
          <Route path="/" element={<Register/>} />
          <Route path={`/chatroom/*`} element={<ChatRoom />} />
          <Route path='*' element={<Register/>} />
        </Routes>
      </Router>
    </div>
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