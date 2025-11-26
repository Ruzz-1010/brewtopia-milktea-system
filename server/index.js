const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ SIMPLE CORS FIX
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

// ✅ AUTO-CREATE ADMIN FUNCTION
const createDefaultAdmin = async () => {
  try {
    const User = require('./models/User');
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
      console.log('⚠️  Change password after first login!');
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (error) {
    console.log('ℹ️  Admin setup note:', error.message);
  }
};

// ✅ MONGODB CONNECTION WITH ADMIN CREATION
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    createDefaultAdmin(); // 👈 CREATE ADMIN AFTER CONNECTION
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ IMPORT ROUTES
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

// ✅ USE ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// ✅ DIRECT PRODUCTS DATA
const products = [
  {
    id: 1,
    name: "Classic Milk Tea",
    price: 120,
    image: "🧋",
    description: "Original milk tea with creamy taste",
    category: "Milk Tea",
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
  },
  {
    id: 2,
    name: "Wintermelon Milk Tea", 
    price: 130,
    image: "🍈",
    description: "Sweet wintermelon with fresh milk",
    category: "Milk Tea",
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
  },
  {
    id: 3,
    name: "Taro Milk Tea",
    price: 140,
    image: "🟣", 
    description: "Creamy taro flavor with pearls",
    category: "Milk Tea",
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
  },
  {
    id: 4,
    name: "Matcha Milk Tea",
    price: 150,
    image: "🍵",
    description: "Premium matcha with milk", 
    category: "Milk Tea",
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
  }
];

// ✅ DIRECT ROUTES
app.get('/api/products', (req, res) => {
  console.log('📦 Products requested');
  res.json(products);
});

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    message: 'Brewtopia API is healthy! 🚀'
  });
});

// ✅ ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brewtopia Backend is LIVE! 🚀',
    database: 'Connected',
    environment: process.env.NODE_ENV,
    endpoints: {
      products: '/api/products',
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin',
      orders: '/api/orders'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 MongoDB: Connected`);
  console.log(`🌐 CORS: Enabled for all origins`);
});