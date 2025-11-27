import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomizationModal from './CustomizationModal';
import AuthModal from './AuthModal';
import AdminDashboard from './AdminDashboard';
import PaymentModal from './PaymentModal';
import QRCode from 'qrcode.react'; // Install this package
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
    <div className="premium-spinner">
      <div className="spinner-bubble"></div>
      <div className="spinner-bubble"></div>
      <div className="spinner-bubble"></div>
    </div>
  );

  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="premium-admin-layout">
        <div className="premium-admin-header">
          <button onClick={switchToCustomer} className="back-btn">
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
    <div className="premium-dashboard">
      {/* Premium Header */}
      <header className={`premium-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="brand-section">
            <div className="logo-wrapper">
              <div className="logo-icon">🧋</div>
              <div className="logo-glow"></div>
            </div>
            <div className="brand-info">
              <h1>Brewtopia</h1>
              <span>Premium Bubble Tea</span>
            </div>
          </div>

          <div className="search-section">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search premium drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="actions-section">
            {user ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.name}</span>
                </div>
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
              <button onClick={() => setShowAuthModal(true)} className="sign-in-btn">
                Sign In
              </button>
            )}
            
            <div className="cart-widget">
              <div className="cart-button" onClick={() => cart.length > 0 && document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' })}>
                <span className="cart-icon">🛒</span>
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
                <span className="cart-amount">₱{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Premium Animation */}
      <section className="premium-hero">
        <div className="hero-background">
          <div className="floating-elements">
            <div className="bubble-element"></div>
            <div className="bubble-element"></div>
            <div className="bubble-element"></div>
            <div className="bubble-element"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">
              <span className="title-main">Premium Bubble Tea</span>
              <span className="title-sub">Crafted to Perfection</span>
            </h2>
            <p className="hero-description">
              Experience the finest ingredients, expertly crafted into 
              extraordinary bubble tea beverages
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Premium Varieties</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15min</span>
                <span className="stat-label">Artisan Crafting</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Loved by Thousands</span>
              </div>
            </div>
            <button className="cta-button" onClick={() => document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' })}>
              Explore Menu
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="premium-content">
        <div className="content-container">
          {/* Premium Category Filter */}
          <section className="category-section">
            <div className="section-header">
              <h3>Our Premium Collection</h3>
              <p>Each beverage is carefully crafted with premium ingredients</p>
            </div>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Premium Products Grid */}
          <section className="products-section">
            {loading ? (
              <div className="premium-loading">
                <LoadingSpinner />
                <p className="loading-text">Crafting your premium drinks...</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product._id} className="premium-product-card">
                    <div className="product-visual">
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
                      <div className="product-fallback">
                        <span className="fallback-icon">
                          {product.category === 'Milk Tea' && '🧋'}
                          {product.category === 'Fruit Tea' && '🍓'}
                          {product.category === 'Coffee' && '☕'}
                          {product.category === 'Specialty' && '🌟'}
                          {product.category === 'Seasonal' && '🎄'}
                        </span>
                      </div>
                      <div className="product-overlay">
                        <div className="overlay-content">
                          <h4>{product.name}</h4>
                          <p>{product.description}</p>
                          <button 
                            className="overlay-cta"
                            onClick={() => handleAddToCart(product)}
                          >
                            Customize Drink
                          </button>
                        </div>
                      </div>
                      <div className="product-category-badge">{product.category}</div>
                    </div>
                    
                    <div className="product-info">
                      <div className="info-header">
                        <h3 className="product-name">{product.name}</h3>
                        <span className="product-price">₱{product.price}</span>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="info-footer">
                        <div className="product-features">
                          <span className="feature-tag">Premium</span>
                          <span className="feature-tag">Fresh</span>
                          <span className="feature-tag">Artisan</span>
                        </div>
                        <button 
                          className="premium-add-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <span>Add to Cart</span>
                          <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Premium Cart Section */}
          <section className="cart-section">
            <div className="premium-cart">
              <div className="cart-header">
                <h3 className="cart-title">Your Premium Order</h3>
                <span className="cart-count">{cart.length} items</span>
              </div>

              {cartLoading ? (
                <div className="cart-loading">
                  <LoadingSpinner />
                  <p>Updating your order...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-visual">
                    <div className="empty-icon">🧋</div>
                    <div className="empty-pattern"></div>
                  </div>
                  <h4>Your cart awaits</h4>
                  <p>Add premium drinks to begin your experience</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="premium-cart-item">
                        <div className="item-visual">
                          <div className="item-image">
                            {item.category === 'Milk Tea' && '🧋'}
                            {item.category === 'Fruit Tea' && '🍓'}
                            {item.category === 'Coffee' && '☕'}
                            {item.category === 'Specialty' && '🌟'}
                            {item.category === 'Seasonal' && '🎄'}
                          </div>
                        </div>
                        <div className="item-details">
                          <div className="item-header">
                            <h4 className="item-name">{item.name}</h4>
                            <button 
                              className="item-remove"
                              onClick={() => removeFromCart(index)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="item-customizations">
                            <span className="custom-item">{item.customizations.size}</span>
                            <span className="custom-item">{item.customizations.sugar}</span>
                            <span className="custom-item">{item.customizations.ice}</span>
                          </div>
                          <span className="item-price">₱{item.finalPrice || item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-summary">
                    <div className="summary-header">
                      <span>Order Total</span>
                      <span className="summary-price">₱{getTotalPrice()}</span>
                    </div>
                    <button 
                      className={`premium-checkout-btn ${!user ? 'disabled' : ''}`}
                      onClick={handleCheckout}
                      disabled={!user}
                    >
                      {user ? (
                        <>
                          <span>Proceed to Payment</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      ) : (
                        'Sign In to Continue'
                      )}
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

      {/* Premium Footer */}
      <footer className="premium-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">🧋</div>
            <div className="footer-info">
              <h4>Brewtopia</h4>
              <p>Premium Bubble Tea Experience</p>
            </div>
          </div>
          <div className="footer-links">
            <a href="#menu" className="footer-link">Menu</a>
            <a href="#about" className="footer-link">About</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#privacy" className="footer-link">Privacy</a>
          </div>
          <div className="footer-social">
            <a href="#" className="social-link">📱</a>
            <a href="#" className="social-link">📧</a>
            <a href="#" className="social-link">📍</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Brewtopia. Crafted with love for bubble tea enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;