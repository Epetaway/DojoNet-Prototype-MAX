
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ToastProvider from './components/ToastProvider.jsx'
import { initTheme } from './lib/theme'
import { ensureDemoAccount } from './lib/demo'

initTheme()
// Create a local demo auth account for GitHub Pages demo
ensureDemoAccount()

// GitHub Pages SPA fallback handling
(function() {
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, null, redirect);
  }
})();

const basename = import.meta.env.PROD ? '/DojoNet-Prototype-MAX' : '';

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>
)
