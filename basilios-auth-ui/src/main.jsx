import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/theme.css'
import './styles/app.css'
import './styles/dark-mode.css'
import './styles/high-contrast.css'
import './styles/hc-toggle.css'
import './utils/themeManager.js'
import "./styles/cadastrarproduto.css";



createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
