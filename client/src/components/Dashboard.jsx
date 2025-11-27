import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomizationModal from './CustomizationModal';
import AuthModal from './AuthModal';
import AdminDashboard from './AdminDashboard';
import './Dashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    const savedUser = localStorage.getItem('brewtopia_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (userData.role === 'admin') {
        setCurrentView('admin');
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleCustomizedAddToCart = (cartItem) => {
    setCartLoading(true);
    setTimeout(() => {
      setCart([...cart, cartItem]);
      setCartLoading(false);
    }, 500);
  };

  const removeFromCart = (index) => {
    setCartLoading(true);
    setTimeout(() => {
      const newCart = cart.filter((_, i) => i !== index);
      setCart(newCart);
      setCartLoading(false);
    }, 300);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.finalPrice || item.price), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setCartLoading(true);
    setTimeout(() => {
      alert(`Order placed! Total: ₱${getTotalPrice()}`);
      setCart([]);
      setCartLoading(false);
    }, 1000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('brewtopia_user', JSON.stringify(userData));
    localStorage.setItem('brewtopia_token', userData.token);
    
    if (userData.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('customer');
    localStorage.removeItem('brewtopia_user');
    localStorage.removeItem('brewtopia_token');
  };

  const switchToAdmin = () => {
    if (user && user.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const switchToCustomer = () => {
    setCurrentView('customer');
  };

  // Loading component
  const LoadingSpinner = ({ size = 'medium' }) => (
    <div className={`loading-spinner ${size}`}>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
    </div>
  );

  // If user is admin and in admin view, show AdminDashboard
  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="admin-container">
        <div className="admin-switcher">
          <button onClick={switchToCustomer} className="switch-btn">
            🧋 Switch to Customer View
          </button>
          <span>Welcome, Admin {user.name}! 👋</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Customer View
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🧋</div>
            <h1>Brewtopia Milk Tea</h1>
          </div>
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">Welcome, {user.name}! 👋</span>
                {user.role === 'admin' && (
                  <button onClick={switchToAdmin} className="admin-access-btn">
                   
                  </button>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Login/Register
              </button>
            )}
            <div className="cart-summary">
              <span className="cart-icon">🛒</span>
              <span className="cart-count">{cart.length} items</span>
              <span className="cart-total">₱{getTotalPrice()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Products Grid */}
        <div className="products-section">
          <div className="section-header">
            <h2>Our Milk Tea Menu</h2>
            <div className="decorative-line"></div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" />
              <p>Brewing our delicious menu...</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <span className="product-emoji">{product.image}</span>
                    <div className="product-overlay">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Customize & Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price">₱{product.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="cart-section">
          <div className="section-header">
            <h2>🛒 Your Order</h2>
            <div className="decorative-line"></div>
          </div>
          
          {cartLoading ? (
            <div className="loading-container">
              <LoadingSpinner />
              <p>Updating cart...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🧋</div>
              <p>Your cart is empty</p>
              <p className="empty-cart-subtitle">Add some delicious milk tea!</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-info">
                    <strong className="item-name">{item.name}</strong>
                    <div className="customization-details">
                      <span>Size: {item.customizations.size}</span>
                      <span>Sugar: {item.customizations.sugar}</span>
                      <span>Ice: {item.customizations.ice}</span>
                      {item.customizations.addons.length > 0 && (
                        <span>Add-ons: {item.customizations.addons.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <span className="item-price">₱{item.finalPrice || item.price}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(index)}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: ₱{getTotalPrice()}</strong>
                </div>
                <button 
                  className={`checkout-btn ${!user ? 'checkout-disabled' : ''}`} 
                  onClick={handleCheckout}
                  disabled={!user}
                >
                  {user ? 'Place Order' : 'Login to Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <CustomizationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleCustomizedAddToCart}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default Dashboard;