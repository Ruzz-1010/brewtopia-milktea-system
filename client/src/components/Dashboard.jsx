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
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'admin'

  useEffect(() => {
    loadProducts();
    // Check if user is already logged in
    const savedUser = localStorage.getItem('brewtopia_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Auto-switch to admin view if user is admin
      if (userData.role === 'admin') {
        setCurrentView('admin');
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleCustomizedAddToCart = (cartItem) => {
    setCart([...cart, cartItem]);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.finalPrice || item.price), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    alert(`Order placed! Total: ₱${getTotalPrice()}`);
    setCart([]);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Save to localStorage
    localStorage.setItem('brewtopia_user', JSON.stringify(userData));
    localStorage.setItem('brewtopia_token', userData.token);
    
    // Auto-switch to admin view if admin
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

  // If user is admin and in admin view, show AdminDashboard
  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div>
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
        <h1>🧋 Brewtopia Milk Tea</h1>
        <div className="header-actions">
          {user ? (
            <div className="user-info">
              <span>Welcome, {user.name}! 👋</span>
              {user.role === 'admin' && (
                <button onClick={switchToAdmin} className="admin-access-btn">
                  ⚙️ Admin Panel
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
            🛒 {cart.length} items - ₱{getTotalPrice()}
          </div>
        </div>
      </header>

      <div className="container">
        {/* Products Grid */}
        <div className="products-section">
          <h2>Our Milk Tea Menu</h2>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <span>{product.image}</span>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-price">₱{product.price}</div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Customize & Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="cart-section">
          <h2>🛒 Your Order</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-info">
                    <strong>{item.name}</strong>
                    <div>Size: {item.customizations.size}</div>
                    <div>Sugar: {item.customizations.sugar}</div>
                    <div>Ice: {item.customizations.ice}</div>
                    {item.customizations.addons.length > 0 && (
                      <div>Add-ons: {item.customizations.addons.join(', ')}</div>
                    )}
                  </div>
                  <div className="item-actions">
                    <span>₱{item.finalPrice || item.price}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(index)}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <strong>Total: ₱{getTotalPrice()}</strong>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                {user ? 'Place Order' : 'Login to Checkout'}
              </button>
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