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
  const LoadingSpinner = () => (
    <div className="loading-dots">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  // If user is admin and in admin view, show AdminDashboard
  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="admin-layout">
        <div className="admin-header">
          <button onClick={switchToCustomer} className="back-btn">
            ← Back to Store
          </button>
          <div className="admin-info">
            <span>Admin: {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Customer View
  return (
    <div className="store-front">
      {/* Header */}
      <header className="store-header">
        <div className="header-container">
          <div className="brand">
            <h1>Brewtopia</h1>
            <span className="tagline">Premium Milk Tea</span>
          </div>
          
          <div className="header-controls">
            {user ? (
              <div className="user-section">
                <span className="welcome">Welcome, {user.name}</span>
                {user.role === 'admin' && (
                  <button onClick={switchToAdmin} className="admin-btn">
                    Admin
                  </button>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="signin-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            )}
            
            <div className="cart-preview">
              <div className="cart-icon">
                🛒
                {cart.length > 0 && (
                  <span className="cart-count">{cart.length}</span>
                )}
              </div>
              <div className="cart-total">₱{getTotalPrice()}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="store-main">
        <div className="layout-grid">
          {/* Products Section */}
          <section className="products-section">
            <div className="section-header">
              <h2>Menu</h2>
              <p>Choose from our selection of premium milk teas</p>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoadingSpinner />
                <p>Loading menu...</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <span className="product-icon">{product.image}</span>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-footer">
                        <span className="price">₱{product.price}</span>
                        <button 
                          className="add-btn"
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

          {/* Cart Sidebar */}
          <aside className="cart-sidebar">
            <div className="cart-container">
              <div className="cart-header">
                <h3>Your Cart</h3>
                <div className="item-count">{cart.length} items</div>
              </div>

              {cartLoading ? (
                <div className="cart-loading">
                  <LoadingSpinner />
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🧋</div>
                  <p>Your cart is empty</p>
                  <span>Add items to get started</span>
                </div>
              ) : (
                <div className="cart-content">
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-info">
                          <div className="item-header">
                            <strong>{item.name}</strong>
                            <span className="item-price">₱{item.finalPrice || item.price}</span>
                          </div>
                          <div className="item-details">
                            <span>{item.customizations.size}</span>
                            <span>• {item.customizations.sugar} sugar</span>
                            <span>• {item.customizations.ice} ice</span>
                            {item.customizations.addons.length > 0 && (
                              <span>• +{item.customizations.addons.length}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(index)}
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="total-section">
                      <div className="total-label">Total</div>
                      <div className="total-amount">₱{getTotalPrice()}</div>
                    </div>
                    <button 
                      className={`checkout-btn ${!user ? 'disabled' : ''}`}
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