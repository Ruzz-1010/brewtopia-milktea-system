import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'https://brewtopia-backend.onrender.com';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Load products
    axios.get(`${API_URL}/api/products`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error loading products:', error);
      });
  }, []);

  const addToCart = (product) => {
    const cartItem = {
      ...product,
      quantity: 1,
      customizations: {
        size: 'Regular',
        sugar: '50%',
        ice: 'Regular',
        addons: []
      }
    };
    setCart([...cart, cartItem]);
    alert(`${product.name} added to cart!`);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <h1>🧋 Brewtopia Milk Tea</h1>
        <div className="cart-summary">
          🛒 Cart: {cart.length} items - ₱{getTotalPrice()}
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
                  <span>🍵</span>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-price">₱{product.price}</div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
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
                  </div>
                  <div className="item-actions">
                    <span>₱{item.price}</span>
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
              <button className="checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;