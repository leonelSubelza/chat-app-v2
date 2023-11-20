import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserDataContext } from './context/UserDataContext';
import 'bootstrap/dist/css/bootstrap.min.css'
/*import 'bootstrap/dist/js/bootstrap.bundle'*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserDataContext>
      <App />
    </UserDataContext>
  </React.StrictMode>
);
