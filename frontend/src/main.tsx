import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/globals.css'; // Move your app/globals.css here

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);