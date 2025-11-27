const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    product: String,
    quantity: Number,
    price: Number,
    customizations: {
      size: String,
      sugar: String,
      ice: String,
      addons: [String]
    }
  }],
  totalAmount: Number,
  orderType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cod', 'gcash', 'maya', 'card'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `BT${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);