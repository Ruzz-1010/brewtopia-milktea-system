import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://brewtopia-backend.onrender.com'

function App() {
  const [message, setMessage] = useState('')
  const [health, setHealth] = useState({})

  // Test backend connection
  useEffect(() => {
    axios.get(API_URL)
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        setMessage('❌ Backend connection failed')
      })

    // Check health
    axios.get(`${API_URL}/health`)
      .then(response => {
        setHealth(response.data)
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧋 Brewtopia Milk Tea Shop</h1>
      
      <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
        <h2>Backend Status:</h2>
        <p><strong>Message:</strong> {message}</p>
        <p><strong>Database:</strong> {health.database}</p>
        <p><strong>Status:</strong> {health.status}</p>
        <p><strong>Last Check:</strong> {health.timestamp}</p>
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

      <div style={{ marginTop: '20px', background: '#e6ffe6', padding: '15px', borderRadius: '8px' }}>
        <h3>🎯 Next Steps:</h3>
        <ol>
          <li>Add Product Management</li>
          <li>Create Order System</li>
          <li>Build Admin Panel</li>
          <li>Add Inventory Tracking</li>
        </ol>
      </div>
    </div>
  )
}

export default App