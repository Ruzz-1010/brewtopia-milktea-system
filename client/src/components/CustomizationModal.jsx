import React, { useState } from 'react';
import './CustomizationModal.css';

function CustomizationModal({ product, onClose, onAddToCart }) {
  const [customizations, setCustomizations] = useState({
    size: product.customizations.sizes[0],
    sugar: product.customizations.sugarLevels[2], // Default 50%
    ice: product.customizations.iceLevels[2], // Default Regular
    addons: []
  });

  const toggleAddon = (addon) => {
    setCustomizations(prev => ({
      ...prev,
      addons: prev.addons.includes(addon)
        ? prev.addons.filter(a => a !== addon)
        : [...prev.addons, addon]
    }));
  };

  const calculateTotal = () => {
    const sizePrice = customizations.size.price;
    const addonsPrice = customizations.addons.reduce((total, addon) => total + addon.price, 0);
    return product.price + sizePrice + addonsPrice;
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity: 1,
      customizations: {
        size: customizations.size.name,
        sugar: customizations.sugar,
        ice: customizations.ice,
        addons: customizations.addons.map(a => a.name)
      },
      finalPrice: calculateTotal()
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Customize {product.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="customization-section">
          <h3>Size</h3>
          <div className="options-grid">
            {product.customizations.sizes.map(size => (
              <button
                key={size.name}
                className={`option-btn ${customizations.size.name === size.name ? 'selected' : ''}`}
                onClick={() => setCustomizations(prev => ({ ...prev, size }))}
              >
                {size.name} {size.price > 0 ? `(+₱${size.price})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Sugar Level</h3>
          <div className="options-grid">
            {product.customizations.sugarLevels.map(level => (
              <button
                key={level}
                className={`option-btn ${customizations.sugar === level ? 'selected' : ''}`}
                onClick={() => setCustomizations(prev => ({ ...prev, sugar: level }))}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Ice Level</h3>
          <div className="options-grid">
            {product.customizations.iceLevels.map(level => (
              <button
                key={level}
                className={`option-btn ${customizations.ice === level ? 'selected' : ''}`}
                onClick={() => setCustomizations(prev => ({ ...prev, ice: level }))}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Add-ons</h3>
          <div className="addons-grid">
            {product.customizations.addons.map(addon => (
              <label key={addon.name} className="addon-item">
                <input
                  type="checkbox"
                  checked={customizations.addons.includes(addon)}
                  onChange={() => toggleAddon(addon)}
                />
                <span>{addon.name} (+₱{addon.price})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <div className="total-price">
            Total: <strong>₱{calculateTotal()}</strong>
          </div>
          <button className="add-to-cart-modal-btn" onClick={handleAddToCart}>
            Add to Cart - ₱{calculateTotal()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;