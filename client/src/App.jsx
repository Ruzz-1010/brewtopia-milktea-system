import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('customer');

  return (
    <div className="App">
      {/* Simple navigation */}
      <div className="app-nav">
        <button 
          onClick={() => setCurrentView('customer')}
          className={currentView === 'customer' ? 'active' : ''}
        >
          🧋 Customer View
        </button>
        <button 
          onClick={() => setCurrentView('admin')}
          className={currentView === 'admin' ? 'active' : ''}
        >
          ⚙️ Admin Panel
        </button>
      </div>

      {currentView === 'customer' ? (
        <Dashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}

export default App;