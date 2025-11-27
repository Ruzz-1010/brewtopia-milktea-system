/* CustomizationModal.jsx */
import React, { useState, useEffect } from 'react';

export default function CustomizationModal({ product, onClose, onAddToCart }) {
  const [customizations, setCustomizations] = useState({
    size: 'Regular',
    sugar: '50%',
    ice: 'Regular Ice',
    addons: []
  });

  const [quantity, setQuantity] = useState(1);

  // Reset customizations when product changes
  useEffect(() => {
    setCustomizations({
      size: 'Regular',
      sugar: '50%',
      ice: 'Regular Ice',
      addons: []
    });
    setQuantity(1);
  }, [product]);

  // Default customization options
  const sizeOptions = [
    { name: 'Regular', price: 0 },
    { name: 'Large', price: 20 },
    { name: 'X-Large', price: 30 }
  ];

  const sugarOptions = ['0%', '25%', '50%', '75%', '100%'];
  const iceOptions = ['No Ice', 'Less Ice', 'Regular Ice'];
  
  const addonOptions = [
    { name: 'Pearls', price: 15 },
    { name: 'Pudding', price: 20 },
    { name: 'Whip Cream', price: 25 },
    { name: 'Cheese Foam', price: 30 },
    { name: 'Aloe Vera', price: 15 },
    { name: 'Crystal', price: 10 }
  ];

  // Calculate base price based on size
  const getBasePrice = () => {
    const size = sizeOptions.find(s => s.name === customizations.size);
    return (product.price || 0) + (size ? size.price : 0);
  };

  // Calculate addons total
  const getAddonsTotal = () => {
    return customizations.addons.reduce((total, addonName) => {
      const addon = addonOptions.find(a => a.name === addonName);
      return total + (addon ? addon.price : 0);
    }, 0);
  };

  // Calculate final price
  const getFinalPrice = () => {
    return (getBasePrice() + getAddonsTotal()) * quantity;
  };

  // Handle size change
  const handleSizeChange = (sizeName) => {
    setCustomizations(prev => ({
      ...prev,
      size: sizeName
    }));
  };

  // Handle sugar level change
  const handleSugarChange = (sugarLevel) => {
    setCustomizations(prev => ({
      ...prev,
      sugar: sugarLevel
    }));
  };

  // Handle ice level change
  const handleIceChange = (iceLevel) => {
    setCustomizations(prev => ({
      ...prev,
      ice: iceLevel
    }));
  };

  // Handle addon toggle
  const handleAddonToggle = (addonName) => {
    setCustomizations(prev => ({
      ...prev,
      addons: prev.addons.includes(addonName)
        ? prev.addons.filter(a => a !== addonName)
        : [...prev.addons, addonName]
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const finalPrice = getFinalPrice();
    const basePrice = getBasePrice();
    
    const cartItem = {
      ...product,
      finalPrice: finalPrice,
      price: basePrice, // Store base price for reference
      quantity: quantity,
      customizations: {
        ...customizations,
        addons: customizations.addons.map(addonName => {
          const addon = addonOptions.find(a => a.name === addonName);
          return {
            name: addonName,
            price: addon ? addon.price : 0
          };
        })
      }
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #ffe8f1;
          background: #fff8fb;
          border-radius: 20px 20px 0 0;
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #d63384;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #777;
          line-height: 1;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: #ffe8f1;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .product-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: flex-start;
        }

        .product-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .product-details {
          flex: 1;
        }

        .product-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .product-description {
          color: #777;
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
        }

        .base-price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #d63384;
        }

        .customization-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title::before {
          content: '⚙️';
          font-size: 1rem;
        }

        .options-grid {
          display: grid;
          gap: 0.5rem;
        }

        .size-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .option-button {
          padding: 0.7rem 1rem;
          border: 2px solid #ffe8f1;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          flex: 1;
          min-width: 80px;
          text-align: center;
        }

        .option-button.selected {
          background: #d63384;
          color: white;
          border-color: #d63384;
        }

        .option-button:hover:not(.selected) {
          border-color: #d63384;
          background: #fff8fb;
        }

        .price-badge {
          font-size: 0.8rem;
          color: #d63384;
          font-weight: 600;
          margin-left: 0.3rem;
        }

        .addons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        @media (max-width: 480px) {
          .addons-grid {
            grid-template-columns: 1fr;
          }
        }

        .addon-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem;
          border: 2px solid #ffe8f1;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .addon-option.selected {
          background: #fff8fb;
          border-color: #d63384;
        }

        .addon-option:hover {
          border-color: #d63384;
        }

        .addon-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .addon-option.selected .addon-checkbox {
          background: #d63384;
          border-color: #d63384;
        }

        .addon-option.selected .addon-checkbox::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .addon-info {
          flex: 1;
        }

        .addon-name {
          font-weight: 600;
          margin: 0;
        }

        .addon-price {
          color: #d63384;
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0;
        }

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          padding: 1rem;
          background: #fff8fb;
          border-radius: 12px;
        }

        .quantity-label {
          font-weight: 600;
          color: #333;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-left: auto;
        }

        .quantity-button {
          width: 40px;
          height: 40px;
          border: 2px solid #d63384;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          color: #d63384;
          transition: all 0.2s;
        }

        .quantity-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-button:hover:not(:disabled) {
          background: #d63384;
          color: white;
        }

        .quantity-display {
          font-size: 1.2rem;
          font-weight: 700;
          min-width: 30px;
          text-align: center;
          color: #333;
        }

        .price-summary {
          background: #fff8fb;
          padding: 1.2rem;
          border-radius: 12px;
          margin: 1.5rem 0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .price-row:last-child {
          margin-bottom: 0;
          border-top: 1px solid #ffe8f1;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }

        .price-label {
          color: #777;
        }

        .price-value {
          font-weight: 600;
          color: #333;
        }

        .final-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #d63384;
        }

        .add-to-cart-button {
          width: 100%;
          padding: 1rem;
          background: #d63384;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-to-cart-button:hover {
          background: #c22575;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(214, 51, 132, 0.3);
        }

        .add-to-cart-button:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Customize Your Drink</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            <div className="product-info">
              <img 
                src={product.image || 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'} 
                alt={product.name}
                className="product-image"
              />
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="base-price">Base Price: ₱{product.price}</div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="customization-section">
              <h4 className="section-title">Size</h4>
              <div className="size-options">
                {sizeOptions.map(size => (
                  <button
                    key={size.name}
                    className={`option-button ${customizations.size === size.name ? 'selected' : ''}`}
                    onClick={() => handleSizeChange(size.name)}
                  >
                    {size.name}
                    {size.price > 0 && (
                      <span className="price-badge">+₱{size.price}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sugar Level */}
            <div className="customization-section">
              <h4 className="section-title">Sugar Level</h4>
              <div className="options-grid">
                <div className="size-options">
                  {sugarOptions.map(sugar => (
                    <button
                      key={sugar}
                      className={`option-button ${customizations.sugar === sugar ? 'selected' : ''}`}
                      onClick={() => handleSugarChange(sugar)}
                    >
                      {sugar}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ice Level */}
            <div className="customization-section">
              <h4 className="section-title">Ice Level</h4>
              <div className="options-grid">
                <div className="size-options">
                  {iceOptions.map(ice => (
                    <button
                      key={ice}
                      className={`option-button ${customizations.ice === ice ? 'selected' : ''}`}
                      onClick={() => handleIceChange(ice)}
                    >
                      {ice}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Addons */}
            <div className="customization-section">
              <h4 className="section-title">Addons</h4>
              <div className="addons-grid">
                {addonOptions.map(addon => (
                  <div
                    key={addon.name}
                    className={`addon-option ${customizations.addons.includes(addon.name) ? 'selected' : ''}`}
                    onClick={() => handleAddonToggle(addon.name)}
                  >
                    <div className="addon-checkbox"></div>
                    <div className="addon-info">
                      <div className="addon-name">{addon.name}</div>
                      <div className="addon-price">+₱{addon.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="quantity-section">
              <div className="quantity-label">Quantity</div>
              <div className="quantity-controls">
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="price-summary">
              <div className="price-row">
                <span className="price-label">Base Price</span>
                <span className="price-value">₱{product.price}</span>
              </div>
              <div className="price-row">
                <span className="price-label">Size ({customizations.size})</span>
                <span className="price-value">
                  +₱{sizeOptions.find(s => s.name === customizations.size)?.price || 0}
                </span>
              </div>
              {customizations.addons.length > 0 && (
                <div className="price-row">
                  <span className="price-label">
                    Addons ({customizations.addons.length})
                  </span>
                  <span className="price-value">+₱{getAddonsTotal()}</span>
                </div>
              )}
              <div className="price-row">
                <span className="price-label">Quantity</span>
                <span className="price-value">×{quantity}</span>
              </div>
              <div className="price-row">
                <span className="price-label final-price">Total</span>
                <span className="price-value final-price">₱{getFinalPrice()}</span>
              </div>
            </div>

            <button className="add-to-cart-button" onClick={handleAddToCart}>
              🛒 Add to Cart - ₱{getFinalPrice()}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}