import React, { useState,useEffect } from 'react'

import ChatRoom from "./components/ChatRoom";
import Register from "./components/Register";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserDataContext } from './context/UserDataContext';

function App() {

  return (
    <>
    <UserDataContext>
    <Router>
        <Routes>
          <Route path="/" element={<Register/>} />
          <Route path="/chatroom" element={<ChatRoom />} />
          <Route path="*" element={<Register/>} />
        </Routes>
      </Router>

    </UserDataContext>
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