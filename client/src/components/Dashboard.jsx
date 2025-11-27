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

  const LoadingSpinner = () => (
    <div className="gradient-spinner">
      <div className="spinner-circle"></div>
    </div>
  );

  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="admin-layout">
        <div className="admin-header">
          <button onClick={switchToCustomer} className="back-btn">
            ← Customer View
          </button>
          <div className="admin-info">
            <span>Welcome, Admin {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">🧋</div>
            <div className="brand-text">
              <h1>Brewtopia</h1>
              <span className="tagline">Premium Bubble Tea</span>
            </div>
          </div>
          
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">Hi, {user.name}! 👋</span>
                {user.role === 'admin' && (
                  <button onClick={switchToAdmin} className="admin-btn">
                    Admin Panel
                  </button>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="auth-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            )}
            
            <div className="cart-summary">
              <div className="cart-icon-wrapper">
                <span className="cart-icon">🛒</span>
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </div>
              <div className="cart-total">₱{getTotalPrice()}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <section className="products-section">
            <div className="section-header">
              <h2>Our Signature Drinks</h2>
              <p>Handcrafted with premium ingredients</p>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoadingSpinner />
                <p>Brewing delicious drinks...</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <span className="product-emoji">{product.image}</span>
                      <div className="product-overlay">
                        <button 
                          className="quick-add-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Customize & Add
                        </button>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-footer">
                        <span className="price">₱{product.price}</span>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="cart-sidebar">
            <div className="cart-container">
              <div className="cart-header">
                <h3>Your Order</h3>
                <div className="items-count">{cart.length} items</div>
              </div>

              {cartLoading ? (
                <div className="cart-loading">
                  <LoadingSpinner />
                  <p>Updating cart...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🧋</div>
                  <p>Your cart is empty</p>
                  <span>Add some delicious drinks!</span>
                </div>
              ) : (
                <div className="cart-content">
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-details">
                          <div className="item-header">
                            <strong>{item.name}</strong>
                            <span className="item-price">₱{item.finalPrice || item.price}</span>
                          </div>
                          <div className="customization-info">
                            <span>{item.customizations.size}</span>
                            <span>• {item.customizations.sugar} sugar</span>
                            <span>• {item.customizations.ice} ice</span>
                            {item.customizations.addons.length > 0 && (
                              <span>• +{item.customizations.addons.length} add-ons</span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="remove-item-btn"
                          onClick={() => removeFromCart(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="total-section">
                      <span className="total-label">Total</span>
                      <span className="total-amount">₱{getTotalPrice()}</span>
                    </div>
                    <button 
                      className={`checkout-btn ${!user ? 'checkout-disabled' : ''}`}
                      onClick={handleCheckout}
                      disabled={!user}
                    >
                      {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

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