const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Brewtopia Backend is LIVE! 🚀',
    database: 'Connected',
    environment: process.env.NODE_ENV
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});