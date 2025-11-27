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
    ? products 
    : products.filter(product => product.category === activeCategory);

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
    <div className="bubble-tea-spinner">
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
    </div>
  );

  if (currentView === 'admin' && user && user.role === 'admin') {
    return (
      <div className="admin-layout">
        <div className="admin-header">
          <button onClick={switchToCustomer} className="back-to-shop-btn">
            🧋 Back to Shop
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
    <div className="milk-tea-dashboard">
      {/* Header */}
      <header className="tea-shop-header">
        <div className="header-container">
          <div className="shop-brand">
            <div className="logo">🧋</div>
            <div className="brand-text">
              <h1>Brewtopia</h1>
              <span className="tagline">Bubble Tea Paradise</span>
            </div>
          </div>
          
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">Hi, {user.name}! 👋</span>
                {user.role === 'admin' && (
                  <button onClick={switchToAdmin} className="admin-panel-btn">
                    🛠️ Admin Panel
                  </button>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="sign-in-btn"
                onClick={() => setShowAuthModal(true)}
              >
                👤 Sign In
              </button>
            )}
            
            <div className="cart-section">
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

      {/* Main Content */}
      <main className="shop-main">
        <div className="shop-container">
          {/* Categories */}
          <section className="categories-section">
            <div className="categories-container">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'All' && '🍹'}
                  {category === 'Milk Tea' && '🧋'}
                  {category === 'Fruit Tea' && '🍓'}
                  {category === 'Coffee' && '☕'}
                  {category === 'Specialty' && '🌟'}
                  {category === 'Seasonal' && '🎄'}
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Products Grid */}
          <section className="products-showcase">
            <div className="showcase-header">
              <h2>Our Bubble Tea Collection</h2>
              <p>Handcrafted with love and premium ingredients</p>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoadingSpinner />
                <p>Brewing your delicious drinks... 🧋</p>
              </div>
            ) : (
              <div className="tea-products-grid">
                {filteredProducts.map(product => (
                  <div key={product._id} className="tea-product-card">
                    <div className="product-image-container">
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
                        {product.category === 'Milk Tea' && '🧋'}
                        {product.category === 'Fruit Tea' && '🍓'}
                        {product.category === 'Coffee' && '☕'}
                        {product.category === 'Specialty' && '🌟'}
                        {product.category === 'Seasonal' && '🎄'}
                      </div>
                      <div className="product-overlay">
                        <button 
                          className="customize-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          🎨 Customize
                        </button>
                      </div>
                      <div className="product-badge">
                        {product.category}
                      </div>
                    </div>
                    
                    <div className="product-details">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      
                      <div className="product-footer">
                        <div className="price-section">
                          <span className="product-price">₱{product.price}</span>
                        </div>
                        <button 
                          className="add-to-cart-button"
                          onClick={() => handleAddToCart(product)}
                        >
                          <span>Add to Cart</span>
                          <span className="cart-plus">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Cart Sidebar */}
          <aside className="order-sidebar">
            <div className="cart-panel">
              <div className="cart-header">
                <h3>Your Order</h3>
                <div className="order-summary">
                  <span className="items-count">{cart.length} items</span>
                  <span className="total-price">₱{getTotalPrice()}</span>
                </div>
              </div>

              {cartLoading ? (
                <div className="cart-loading">
                  <LoadingSpinner />
                  <p>Updating your order...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-cart-icon">🧋</div>
                  <h4>Your cart is empty</h4>
                  <p>Add some delicious bubble tea!</p>
                </div>
              ) : (
                <div className="cart-content">
                  <div className="cart-items-list">
                    {cart.map((item, index) => (
                      <div key={index} className="cart-item-card">
                        <div className="item-info">
                          <div className="item-header">
                            <h4 className="item-name">{item.name}</h4>
                            <span className="item-price">₱{item.finalPrice || item.price}</span>
                          </div>
                          <div className="customization-details">
                            <div className="customization-item">
                              <span className="custom-label">Size:</span>
                              <span>{item.customizations.size}</span>
                            </div>
                            <div className="customization-item">
                              <span className="custom-label">Sugar:</span>
                              <span>{item.customizations.sugar}</span>
                            </div>
                            <div className="customization-item">
                              <span className="custom-label">Ice:</span>
                              <span>{item.customizations.ice}</span>
                            </div>
                            {item.customizations.addons.length > 0 && (
                              <div className="customization-item">
                                <span className="custom-label">Add-ons:</span>
                                <span>{item.customizations.addons.length} items</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          className="remove-item-button"
                          onClick={() => removeFromCart(index)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="total-section">
                      <div className="total-line">
                        <span>Subtotal</span>
                        <span>₱{getTotalPrice()}</span>
                      </div>
                      <div className="total-line main-total">
                        <span>Total</span>
                        <span className="final-price">₱{getTotalPrice()}</span>
                      </div>
                    </div>
                    <button 
                      className={`checkout-button ${!user ? 'needs-login' : ''}`}
                      onClick={handleCheckout}
                      disabled={!user}
                    >
                      {user ? '🥤 Checkout Now' : '🔐 Sign In to Checkout'}
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

      {/* Footer */}
      <footer className="tea-shop-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🧋</span>
            <span className="footer-name">Brewtopia</span>
          </div>
          <p className="footer-tagline">Crafting happiness in every cup</p>
          <div className="footer-info">
            <span>📍 123 Bubble Tea Street, Manila</span>
            <span>🕒 Open: 10AM - 10PM</span>
            <span>📞 (02) 8123-4567</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;