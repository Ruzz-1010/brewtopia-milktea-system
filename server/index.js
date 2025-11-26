const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// FIX CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Add health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    message: 'Brewtopia API is healthy! 🚀'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Brewtopia Backend is LIVE! 🚀',
    database: 'Connected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});