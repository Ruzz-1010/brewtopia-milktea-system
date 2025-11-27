const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

// ✅ IMPORT ROUTES PROPERLY
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');

// ✅ USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// Auto-create admin and sample data
const initializeData = async () => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');

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
    }

    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        // SAME PRODUCTS DATA AS ABOVE
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
        // ... other products
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products created in database');
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
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brewtopia Backend is LIVE! 🚀',
    database: 'Connected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});