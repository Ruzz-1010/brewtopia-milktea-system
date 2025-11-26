import React, { useState } from 'react';
import axios from 'axios';
import './AuthModal.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function AuthModal({ onClose, onLogin, isAdminSetup = false }) {
  const [isLogin, setIsLogin] = useState(!isAdminSetup);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint, payload;

      if (isAdminSetup) {
        // Admin setup
        endpoint = '/setup-admin';
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        };
      } else if (isLogin) {
        // Regular login
        endpoint = '/login';
        payload = {
          email: formData.email,
          password: formData.password
        };
      } else {
        // Customer registration
        endpoint = '/register';
        payload = formData;
      }

      const response = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);
      
      // Save token to localStorage
      localStorage.setItem('brewtopia_token', response.data.token);
      localStorage.setItem('brewtopia_user', JSON.stringify(response.data.user));
      
      onLogin(response.data.user);
      onClose();
      
      if (isAdminSetup) {
        alert('✅ Admin account created successfully!');
      }
      
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <div className="auth-modal-header">
          <h2>
            {isAdminSetup ? 'Setup Admin Account' : (isLogin ? 'Login' : 'Register')}
          </h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {(!isLogin || isAdminSetup) && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          {!isLogin && !isAdminSetup && (
            <>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <textarea
                name="address"
                placeholder="Delivery Address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (
              isAdminSetup ? 'Create Admin Account' : (isLogin ? 'Login' : 'Register')
            )}
          </button>
        </form>

        {!isAdminSetup && (
          <div className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="switch-btn"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;