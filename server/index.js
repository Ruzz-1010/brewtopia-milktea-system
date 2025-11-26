const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
// ✅ SIMPLE CORS FIX
app.use(cors());

app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ DIRECT PRODUCTS DATA (No routes file needed)
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

// ✅ DIRECT ROUTES (No external files)
app.get('/api/products', (req, res) => {
  console.log('📦 Products requested');
  res.json(products);
});

app.post('/api/auth/register', (req, res) => {
  console.log('👤 Registration attempt');
  res.json({ message: 'Registration successful!' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt');
  res.json({ 
    message: 'Login successful!',
    user: {
      id: 1,
      name: 'Test User',
      email: req.body.email || 'test@example.com'
    }
  });
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
      auth: '/api/auth'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 MongoDB: Connected`);
  console.log(`🌐 CORS: Enabled for all origins`);
});