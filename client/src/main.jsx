    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.jsx'
    import { setupAxiosInterceptor } from './utils/auth'

    // Setup axios interceptor for auth tokens
    setupAxiosInterceptor();

    ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    )