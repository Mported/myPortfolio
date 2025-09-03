// ========================
// MAIN ENTRY POINT
// Application bootstrap and setup
// ========================

// Dependencies
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Application Mount
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
