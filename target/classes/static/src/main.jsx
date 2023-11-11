import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserDataContext } from './context/UserDataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserDataContext>
      <App />
    </UserDataContext>
  </React.StrictMode>
);
