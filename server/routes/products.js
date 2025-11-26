const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Sample products with customization options
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
  }
];

// Get all products
router.get('/', async (req, res) => {
  try {
    // For now, return sample products
    res.json(sampleProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});