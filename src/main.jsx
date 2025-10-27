
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ToastProvider from './components/ToastProvider.jsx'
import { initTheme } from './lib/theme'
import { ensureDemoAccount } from './lib/demo'

initTheme()
// In dev, create a local demo auth account (id maps to backend-seeded u_demo)
if (import.meta.env.DEV) {
  ensureDemoAccount()
}
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>
)
