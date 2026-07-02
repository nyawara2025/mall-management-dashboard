import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// 1. Import the PWA register function
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true });

// 2. Register the service worker immediately
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
