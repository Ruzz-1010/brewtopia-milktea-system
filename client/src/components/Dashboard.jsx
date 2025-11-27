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
    <div className="modern-dashboard">
      {/* Modern Header */}
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="brand-section">
            <div className="logo-circle">
              <span className="logo-icon">🧋</span>
            </div>
            <div className="brand-info">
              <h1 className="brand-name">Brewtopia</h1>
              <p className="brand-tagline">Crafted with Love</p>
            </div>
          </div>

          <div className="search-section">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search your favorite drink..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="actions-section">
            {user ? (
              <div className="user-menu">
                <div className="user-greeting">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.name}</span>
                </div>
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
              <button onClick={() => setShowAuthModal(true)} className="sign-in-btn">
                Sign In
              </button>
            )}
            
            <div className="cart-indicator">
              <span className="cart-icon">🛒</span>
              {cart.length > 0 && (
                <span className="cart-count">{cart.length}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">Discover Your Perfect Bubble Tea</h2>
            <p className="hero-subtitle">Handcrafted beverages made with premium ingredients</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Drink Varieties</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15min</span>
                <span className="stat-label">Ready Time</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-bubbles">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Modern Category Pills */}
          <section className="category-section">
            <div className="category-pills">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span className="category-icon">
                    {category === 'All' && '✨'}
                    {category === 'Milk Tea' && '🧋'}
                    {category === 'Fruit Tea' && '🍓'}
                    {category === 'Coffee' && '☕'}
                    {category === 'Specialty' && '🌟'}
                    {category === 'Seasonal' && '🎄'}
                  </span>
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
                <p className="loading-text">Preparing your drinks...</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="card-image-container">
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
                      <div className="image-placeholder">
                        <span className="placeholder-icon">
                          {product.category === 'Milk Tea' && '🧋'}
                          {product.category === 'Fruit Tea' && '🍓'}
                          {product.category === 'Coffee' && '☕'}
                          {product.category === 'Specialty' && '🌟'}
                          {product.category === 'Seasonal' && '🎄'}
                        </span>
                      </div>
                      <div className="card-overlay">
                        <button 
                          className="quick-add-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="product-header">
                        <h3 className="product-title">{product.name}</h3>
                        <span className="product-price">₱{product.price}</span>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="card-footer">
                        <span className="category-tag">{product.category}</span>
                        <button 
                          className="add-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <span>Add</span>
                          <span className="plus-icon">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Modern Cart Sidebar */}
          <aside className="cart-sidebar">
            <div className="cart-container">
              <div className="cart-header">
                <h3 className="cart-title">Your Order</h3>
                <span className="cart-total">₱{getTotalPrice()}</span>
              </div>

              {cartLoading ? (
                <div className="cart-loading">
                  <LoadingSpinner />
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🧋</div>
                  <p className="empty-text">Your cart is empty</p>
                  <p className="empty-subtext">Add some delicious drinks!</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="item-details">
                          <div className="item-header">
                            <h4 className="item-name">{item.name}</h4>
                            <button 
                              className="remove-btn"
                              onClick={() => removeFromCart(index)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="item-customizations">
                            <span className="custom-tag">{item.customizations.size}</span>
                            <span className="custom-tag">{item.customizations.sugar}</span>
                            <span className="custom-tag">{item.customizations.ice}</span>
                          </div>
                          <div className="item-price">₱{item.finalPrice || item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="cart-summary">
                      <span className="summary-label">Total</span>
                      <span className="summary-price">₱{getTotalPrice()}</span>
                    </div>
                    <button 
                      className={`checkout-btn ${!user ? 'disabled' : ''}`}
                      onClick={handleCheckout}
                      disabled={!user}
                    >
                      {user ? 'Checkout' : 'Sign In to Checkout'}
                    </button>
                  </div>
                </>
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

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">🧋</div>
            <div className="footer-info">
              <h4>Brewtopia</h4>
              <p>Crafting happiness in every cup</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h5>Visit Us</h5>
              <p>123 Bubble Tea Street</p>
              <p>Manila, Philippines</p>
            </div>
            <div className="link-group">
              <h5>Hours</h5>
              <p>Mon-Sun: 10AM - 10PM</p>
              <p>Delivery Available</p>
            </div>
            <div className="link-group">
              <h5>Contact</h5>
              <p>(02) 8123-4567</p>
              <p>hello@brewtopia.com</p>
            </div>
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