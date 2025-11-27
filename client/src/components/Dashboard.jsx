import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomizationModal from './CustomizationModal';
import AuthModal from './AuthModal';
import AdminDashboard from './AdminDashboard';
import PaymentModal from './PaymentModal';
import './Dashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const categories = ['All', 'Milk Tea', 'Fruit Tea', 'Coffee', 'Specialty', 'Seasonal'];

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const filteredProducts = activeCategory === 'All' 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(product => 
        product.category === activeCategory && 
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

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
    
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setCartLoading(true);
    setTimeout(() => {
      console.log('Payment successful:', paymentDetails);
      alert(`Order placed successfully! Total: ₱${getTotalPrice()}\nPayment Method: ${paymentDetails.method}`);
      setCart([]);
      setCartLoading(false);
      setShowPaymentModal(false);
    }, 2000);
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
    <div className="modern-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  );

  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="admin-layout">
        <div className="admin-header">
          <button onClick={switchToCustomer} className="back-to-shop-btn">
            ← Back to Shop
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
    <div className="brewtopia-dashboard">
      {/* Clean Header */}
      <header className={`clean-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🧋</div>
            <div className="brand-text">
              <h1>Brewtopia</h1>
              <span>Bubble Tea</span>
            </div>
          </div>

          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  {user.role === 'admin' && (
                    <button onClick={switchToAdmin} className="admin-btn">
                      Admin
                    </button>
                  )}
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="sign-in-btn">
                Sign In
              </button>
            )}
            
            <div className="cart-button" onClick={() => cart.length > 0 && document.querySelector('.cart-panel').scrollIntoView({ behavior: 'smooth' })}>
              <span className="cart-icon">🛒</span>
              {cart.length > 0 && (
                <span className="cart-count">{cart.length}</span>
              )}
              <span className="cart-total">₱{getTotalPrice()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Crafted with Love</h2>
            <p>Discover your perfect bubble tea experience</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Varieties</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15min</span>
                <span className="stat-label">Ready</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Category Filter */}
          <section className="category-filter">
            <div className="category-pills">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Products Grid */}
          <section className="products-section">
            {loading ? (
              <div className="loading-container">
                <LoadingSpinner />
                <p>Preparing your drinks...</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="card-image">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="image-fallback">
                        <span className="fallback-icon">
                          {product.category === 'Milk Tea' && '🧋'}
                          {product.category === 'Fruit Tea' && '🍓'}
                          {product.category === 'Coffee' && '☕'}
                          {product.category === 'Specialty' && '🌟'}
                          {product.category === 'Seasonal' && '🎄'}
                        </span>
                      </div>
                      <div className="card-badge">{product.category}</div>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="card-footer">
                        <span className="product-price">₱{product.price}</span>
                        <button 
                          className="add-button"
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

          {/* Cart Section */}
          <section className="cart-section">
            <div className="cart-panel">
              <div className="cart-header">
                <h3>Your Order</h3>
                <span className="item-count">{cart.length} items</span>
              </div>

              {cartLoading ? (
                <div className="loading-container">
                  <LoadingSpinner />
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🧋</div>
                  <p>Your cart is empty</p>
                  <span className="empty-subtext">Add some drinks to get started</span>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-info">
                          <h4 className="item-name">{item.name}</h4>
                          <div className="item-details">
                            <span>{item.customizations.size}</span>
                            <span>{item.customizations.sugar}</span>
                            <span>{item.customizations.ice}</span>
                          </div>
                          <span className="item-price">₱{item.finalPrice || item.price}</span>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Total</span>
                      <span className="total-price">₱{getTotalPrice()}</span>
                    </div>
                    <button 
                      className={`checkout-btn ${!user ? 'disabled' : ''}`}
                      onClick={handleCheckout}
                      disabled={!user}
                    >
                      {user ? 'Proceed to Payment' : 'Sign In to Checkout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
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

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          totalAmount={getTotalPrice()}
          orderItems={cart}
        />
      )}

      {/* Footer */}
      <footer className="clean-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🧋</span>
            <div className="footer-text">
              <h4>Brewtopia</h4>
              <p>Bubble Tea Paradise</p>
            </div>
          </div>
          <div className="footer-links">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Brewtopia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;