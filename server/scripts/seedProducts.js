const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

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

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/brewtopia?retryWrites=true&w=majority');
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    
    console.log('✅ Products seeded successfully!');
    console.log(`📦 Created ${sampleProducts.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();