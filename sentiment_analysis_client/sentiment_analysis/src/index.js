import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// src/index.js or src/App.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Import base Bootstrap CSS
// import 'bootswatch/dist/quartz/bootstrap.min.css'; // Import your desired Bootswatch theme

// Example for the 'darkly' theme:
// import 'bootswatch/dist/darkly/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
