import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection - DIRECT NA!
const MONGODB_URI = 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'Brewtopia Backend is LIVE! 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});