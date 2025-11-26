const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✅ Admin account already exists:', adminExists.email);
      process.exit(0);
    }
    
    const admin = new User({
      name: 'Brewtopia Admin',
      email: 'admin@brewtopia.com',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@brewtopia.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password immediately!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();