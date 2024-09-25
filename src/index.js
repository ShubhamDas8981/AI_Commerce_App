import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Import BrowserRouter
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      {/* Redirect root ("/") to "/AI_Commerce_App" */}
      <Route path="/" element={<Navigate to="/AI_Commerce_App" />} />
      {/* Render the App component for "/AI_Commerce_App" */}
      <Route path="/AI_Commerce_App" element={<App />} />
    </Routes>
  </Router>
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

