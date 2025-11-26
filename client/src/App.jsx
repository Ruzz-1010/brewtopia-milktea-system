import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://brewtopia-backend.onrender.com'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [health, setHealth] = useState({})
  const [error, setError] = useState('')

  // Test backend connection
  useEffect(() => {
    // Test main endpoint
    axios.get(`${API_URL}/`)
      .then(response => {
        setMessage(response.data.message)
        setError('')
      })
      .catch(error => {
        setMessage('❌ Backend connection failed')
        setError(error.message)
      })

    // Check health endpoint
    axios.get(`${API_URL}/health`)
      .then(response => {
        setHealth(response.data)
      })
      .catch(error => {
        setHealth({
          status: 'ERROR',
          database: 'Unknown',
          timestamp: new Date().toISOString()
        })
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧋 Brewtopia Milk Tea Shop</h1>
      
      {error && (
        <div style={{ background: '#ffe6e6', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
        <h2>Backend Status:</h2>
        <p><strong>Message:</strong> {message}</p>
        <p><strong>Database:</strong> {health.database || 'Loading...'}</p>
        <p><strong>Status:</strong> {health.status || 'Loading...'}</p>
        <p><strong>Last Check:</strong> {health.timestamp || 'Loading...'}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>🚀 Backend Features Ready:</h3>
        <ul>
          <li>✅ Express Server</li>
          <li>✅ MongoDB Database</li>
          <li>✅ CORS Enabled</li>
          <li>✅ Environment Variables</li>
          <li>✅ Production Deployment</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          Refresh Status
        </button>
      </div>
    </div>
  )
}

export default App