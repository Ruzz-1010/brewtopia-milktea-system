import React, { useState, useEffect } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ onClose, onPaymentSuccess, totalAmount, orderItems }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [paymentStep, setPaymentStep] = useState('selection');
  const [gcashQRCode, setGcashQRCode] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  // Sample GCash merchant details - Replace with actual merchant info
  const merchantGCashNumber = '09171234567';
  const merchantName = 'Brewtopia Bubble Tea';

  useEffect(() => {
    if (selectedPaymentMethod === 'gcash' && paymentStep === 'qr') {
      generateGCashQRCode();
    }
  }, [selectedPaymentMethod, paymentStep]);

  const generateGCashQRCode = () => {
    // Generate a simple QR code data string for GCash payment
    // In a real implementation, you would use a QR code generation API
    const qrData = {
      merchant: merchantName,
      number: merchantGCashNumber,
      amount: totalAmount,
      reference: `BREW${Date.now()}`,
      purpose: 'Bubble Tea Order'
    };
    
    setGcashQRCode(JSON.stringify(qrData));
    setPaymentReference(qrData.reference);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    if (method === 'gcash') {
      setPaymentStep('qr');
    } else {
      setPaymentStep('confirmation');
    }
  };

  const handleGCashConfirm = () => {
    if (!gcashNumber.trim()) {
      alert('Please enter your GCash number for confirmation');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        method: 'GCash',
        reference: paymentReference,
        gcashNumber: gcashNumber,
        amount: totalAmount
      });
    }, 3000);
  };

  const handleCODConfirm = () => {
    setIsProcessing(true);
    
    // Simulate order processing for COD
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        method: 'Cash on Delivery',
        reference: `COD${Date.now()}`,
        amount: totalAmount
      });
    }, 2000);
  };

  const renderQRCode = () => {
    // Simple QR code representation
    // In production, use a QR code generation library like qrcode.react
    return (
      <div className="qr-code-container">
        <div className="qr-code-placeholder">
          <div className="qr-pattern">
            {/* Simulated QR code pattern */}
            <div className="qr-grid">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className={`qr-dot ${Math.random() > 0.5 ? 'filled' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="qr-instruction">Scan this code with your GCash app</p>
      </div>
    );
  };

  const renderPaymentSelection = () => (
    <div className="payment-selection">
      <h3>Choose Payment Method</h3>
      <p className="payment-subtitle">Select how you'd like to pay for your order</p>
      
      <div className="payment-methods">
        <div 
          className={`payment-method-card ${selectedPaymentMethod === 'cod' ? 'selected' : ''}`}
          onClick={() => handlePaymentMethodSelect('cod')}
        >
          <div className="method-icon">💵</div>
          <div className="method-content">
            <h4>Cash on Delivery</h4>
            <p>Pay when you receive your order</p>
            <span className="method-badge">No additional fees</span>
          </div>
          <div className="method-radio">
            <div className={`radio-circle ${selectedPaymentMethod === 'cod' ? 'filled' : ''}`} />
          </div>
        </div>

        <div 
          className={`payment-method-card ${selectedPaymentMethod === 'gcash' ? 'selected' : ''}`}
          onClick={() => handlePaymentMethodSelect('gcash')}
        >
          <div className="method-icon">📱</div>
          <div className="method-content">
            <h4>GCash</h4>
            <p>Pay instantly with your GCash wallet</p>
            <span className="method-badge">Instant confirmation</span>
          </div>
          <div className="method-radio">
            <div className={`radio-circle ${selectedPaymentMethod === 'gcash' ? 'filled' : ''}`} />
          </div>
        </div>
      </div>

      <div className="order-summary">
        <h4>Order Summary</h4>
        {orderItems.map((item, index) => (
          <div key={index} className="summary-item">
            <span>{item.name} ({item.customizations.size})</span>
            <span>₱{item.finalPrice || item.price}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <span>₱{totalAmount}</span>
        </div>
      </div>
    </div>
  );

  const renderGCashPayment = () => (
    <div className="gcash-payment">
      <h3>GCash Payment</h3>
      <p className="payment-subtitle">Scan the QR code or send payment manually</p>
      
      <div className="gcash-merchant-info">
        <div className="merchant-details">
          <h4>{merchantName}</h4>
          <p>GCash Number: {merchantGCashNumber}</p>
          <p>Amount: ₱{totalAmount}</p>
          <p>Reference: {paymentReference}</p>
        </div>
      </div>

      {renderQRCode()}

      <div className="manual-payment-option">
        <h4>Or send payment manually:</h4>
        <ol className="payment-steps">
          <li>Open your GCash app</li>
          <li>Send money to: <strong>{merchantGCashNumber}</strong></li>
          <li>Amount: <strong>₱{totalAmount}</strong></li>
          <li>Use reference: <strong>{paymentReference}</strong></li>
          <li>Take a screenshot of your payment confirmation</li>
        </ol>
      </div>

      <div className="form-group">
        <label htmlFor="gcashNumber">Your GCash Number (for confirmation):</label>
        <input
          type="tel"
          id="gcashNumber"
          value={gcashNumber}
          onChange={(e) => setGcashNumber(e.target.value)}
          placeholder="09XX XXX XXXX"
          className="gcash-input"
        />
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="payment-confirmation">
      <div className="confirmation-icon">✅</div>
      <h3>Confirm Payment</h3>
      <p className="confirmation-text">
        {selectedPaymentMethod === 'cod' 
          ? 'You will pay ₱{totalAmount} in cash when your order is delivered.'
          : 'Please confirm that you have sent the GCash payment.'
        }
      </p>
      <div className="confirmation-details">
        <div className="detail-row">
          <span>Payment Method:</span>
          <span>{selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'GCash'}</span>
        </div>
        <div className="detail-row">
          <span>Total Amount:</span>
          <span>₱{totalAmount}</span>
        </div>
        {selectedPaymentMethod === 'gcash' && (
          <div className="detail-row">
            <span>Reference Number:</span>
            <span>{paymentReference}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Payment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {paymentStep === 'selection' && renderPaymentSelection()}
          {paymentStep === 'qr' && renderGCashPayment()}
          {paymentStep === 'confirmation' && renderConfirmation()}
        </div>

        <div className="modal-footer">
          {paymentStep !== 'selection' && (
            <button 
              className="btn-secondary" 
              onClick={() => setPaymentStep('selection')}
              disabled={isProcessing}
            >
              Back
            </button>
          )}
          
          {paymentStep === 'qr' && (
            <button 
              className="btn-primary"
              onClick={handleGCashConfirm}
              disabled={isProcessing || !gcashNumber.trim()}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </button>
          )}
          
          {paymentStep === 'confirmation' && (
            <button 
              className="btn-primary"
              onClick={handleCODConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;