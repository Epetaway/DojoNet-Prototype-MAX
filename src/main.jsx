
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ToastProvider from './components/ToastProvider.jsx'
import { initTheme } from './lib/theme'
import { ensureDemoAccount } from './lib/demo'

initTheme()
// Create a local demo auth account for GitHub Pages demo
ensureDemoAccount()

// In production we use HashRouter; no SPA redirect handling required.

// Optional: global error capture to surface runtime issues on the page
if (typeof window !== 'undefined') {
  const report = (msg) => {
    try {
      let banner = document.getElementById('global-error-banner')
      if (!banner) {
        banner = document.createElement('div')
        banner.id = 'global-error-banner'
        banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ffecec;color:#c00;padding:8px 12px;font:12px/1.4 system-ui, -apple-system, sans-serif;z-index:99999;border-top:1px solid #f5c2c7;'
        document.body.appendChild(banner)
      }
      banner.textContent = 'Runtime error: ' + msg
    } catch {}
  }
  window.addEventListener('error', (e) => report(e?.error?.stack || e?.message || String(e)))
  window.addEventListener('unhandledrejection', (e) => report(e?.reason?.stack || e?.reason?.message || String(e?.reason)))
}

const isProd = import.meta.env.PROD
const basename = isProd ? '/DojoNet-Prototype-MAX' : ''

createRoot(document.getElementById('root')).render(
  isProd ? (
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  ) : (
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  )
)
