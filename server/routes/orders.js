const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Create new order (protected)
router.post('/', auth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customer: {
        ...req.body.customer,
        email: req.user.email // Ensure order is linked to logged-in user
      }
    };
    
    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders (protected)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.user.email })
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID (protected - user can only see their own orders)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order or is admin
    if (order.customer.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;