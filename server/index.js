const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

// Import routes
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);

// Auto-create admin and sample data
const initializeData = async () => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Inventory = require('./models/Inventory');

    // Create admin if doesn't exist
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
    }

    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
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

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products created');
    }

    // Create inventory items if none exist
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      const inventoryItems = [
        { item: "Milk", currentStock: 50, minimumStock: 10, unit: "liters", costPerUnit: 80 },
        { item: "Tea Leaves", currentStock: 20, minimumStock: 5, unit: "kg", costPerUnit: 200 },
        { item: "Pearls", currentStock: 15, minimumStock: 5, unit: "kg", costPerUnit: 150 },
        { item: "Sugar", currentStock: 30, minimumStock: 10, unit: "kg", costPerUnit: 60 },
        { item: "Ice", currentStock: 100, minimumStock: 20, unit: "kg", costPerUnit: 10 }
      ];

      await Inventory.insertMany(inventoryItems);
      console.log('✅ Inventory items created');
    }

  } catch (error) {
    console.log('Data initialization note:', error.message);
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
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      inventory: '/api/inventory',
      health: '/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 MongoDB: Connected`);
  console.log(`🌐 CORS: Enabled for all origins`);
});