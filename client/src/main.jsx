import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// TODO: Uncomment when auth is ready
// import { setupAxiosInterceptor } from './utils/auth'
// setupAxiosInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)