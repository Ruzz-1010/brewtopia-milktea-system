const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

// ✅ USER MANAGEMENT ROUTES
app.get('/api/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ PRODUCTS ROUTES
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ isAvailable: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
    const productData = {
      ...req.body,
      customizations: req.body.customizations || {
        sizes: [
          { name: "Regular", price: 0 },
          { name: "Large", price: 20 },
          { name: "X-Large", price: 30 }
        ],
        sugarLevels: ["0%", "25%", "50%", "75%", "100%"],
        iceLevels: ["No Ice", "Less Ice", "Regular Ice"],
        addons: [
          { name: "Pearls", price: 15 },
          { name: "Pudding", price: 20 },
          { name: "Whip Cream", price: 25 }
        ]
      }
    };
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const User = require('./models/User');
    const { name, email, password, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const user = new User({ 
      name, 
      email, 
      password, 
      phone, 
      address,
      role: 'customer'
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const User = require('./models/User');
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    res.json({ 
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ ORDERS ROUTES - FIXED (NO DUPLICATES)
app.post('/api/orders', async (req, res) => {
  try {
    const Order = require('./models/Order');
    
    console.log('📦 Creating new order:', {
      customer: req.body.customer?.name,
      items: req.body.items?.length,
      total: req.body.totalAmount
    });
    
    const order = new Order(req.body);
    await order.save();
    
    // Get the saved order with generated orderNumber
    const savedOrder = await Order.findById(order._id);
    
    console.log('✅ Order created successfully:', {
      orderNumber: savedOrder.orderNumber,
      id: savedOrder._id,
      status: savedOrder.status
    });
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('❌ Order creation failed:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const orders = await Order.find().sort({ orderDate: -1 });
    
    console.log(`📋 Retrieved ${orders.length} orders`);
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/my-orders/:email', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const orders = await Order.find({ 'customer.email': req.params.email })
      .sort({ orderDate: -1 });
    
    console.log(`📋 Retrieved ${orders.length} orders for ${req.params.email}`);
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ ADMIN ORDERS ROUTES
app.get('/api/admin/orders', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const { status, limit = 50 } = req.query;
    const query = status ? { status } : {};
    
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(parseInt(limit));
    
    console.log(`📋 Admin retrieved ${orders.length} orders`);
    
    res.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching admin orders:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const { status } = req.body;
    
    console.log(`🔄 Updating order ${req.params.id} status to: ${status}`);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('✅ Order status updated successfully');
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/orders/:id/payment', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const { paymentStatus } = req.body;
    
    console.log(`💰 Updating order ${req.params.id} payment status to: ${paymentStatus}`);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('✅ Payment status updated successfully');
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ ADMIN DASHBOARD ROUTES
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const Product = require('./models/Product');
    const User = require('./models/User');
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const todayOrders = await Order.countDocuments({
      orderDate: { 
        $gte: new Date().setHours(0,0,0,0),
        $lt: new Date().setHours(23,59,59,999)
      }
    });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log('📊 Dashboard stats loaded:', {
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });

    res.json({
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers
    });
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ AUTO-CREATE ADMIN AND SAMPLE DATA
const initializeData = async () => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    
    // Create admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        name: 'Brewtopia Admin',
        email: 'admin@brewtopia.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default admin account created');
      console.log('📧 Email: admin@brewtopia.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin account already exists');
    }

    // Create sample products if no products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: "Classic Milk Tea",
          price: 120,
          image: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h=300&fit=crop",
          description: "Original milk tea with creamy taste and chewy pearls",
          category: "Milk Tea",
          isAvailable: true
        },
        {
          name: "Wintermelon Milk Tea", 
          price: 130,
          image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
          description: "Sweet wintermelon with fresh milk and refreshing taste",
          category: "Milk Tea",
          isAvailable: true
        },
        {
          name: "Taro Milk Tea",
          price: 140,
          image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&h=300&fit=crop", 
          description: "Creamy taro flavor with purple yam and chewy pearls",
          category: "Milk Tea",
          isAvailable: true
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product({
          ...productData,
          customizations: {
            sizes: [
              { name: "Regular", price: 0 },
              { name: "Large", price: 20 },
              { name: "X-Large", price: 30 }
            ],
            sugarLevels: ["0%", "25%", "50%", "75%", "100%"],
            iceLevels: ["No Ice", "Less Ice", "Regular Ice"],
            addons: [
              { name: "Pearls", price: 15 },
              { name: "Pudding", price: 20 },
              { name: "Whip Cream", price: 25 }
            ]
          }
        });
        await product.save();
      }
      console.log('✅ Sample products created');
    } else {
      console.log(`✅ ${productCount} products found in database`);
    }

    // Check existing orders
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    console.log(`📦 ${orderCount} orders found in database`);
    
  } catch (error) {
    console.log('❌ Initialization error:', error.message);
  }
};

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    initializeData();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    message: 'Brewtopia API is healthy! 🚀'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brewtopia Backend is LIVE! 🚀',
    database: 'Connected',
    environment: process.env.NODE_ENV,
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders',
      admin: '/api/admin',
      users: '/api/users',
      health: '/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 MongoDB: Connected`);
  console.log(`🌐 CORS: Enabled for all origins`);
});