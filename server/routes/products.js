const express = require('express');
const router = express.Router();

// Sample milk tea products
const products = [
  {
    id: 1,
    name: "Classic Milk Tea",
    price: 120,
    image: "/images/classic-milk-tea.jpg",
    description: "Original milk tea with creamy taste",
    category: "Milk Tea"
  },
  {
    id: 2, 
    name: "Wintermelon Milk Tea",
    price: 130,
    image: "/images/wintermelon-milk-tea.jpg",
    description: "Sweet wintermelon with fresh milk",
    category: "Milk Tea"
  },
  {
    id: 3,
    name: "Taro Milk Tea", 
    price: 140,
    image: "/images/taro-milk-tea.jpg",
    description: "Creamy taro flavor with pearls",
    category: "Milk Tea"
  },
  {
    id: 4,
    name: "Matcha Milk Tea",
    price: 150, 
    image: "/images/matcha-milk-tea.jpg",
    description: "Premium matcha with milk",
    category: "Milk Tea"
  }
];

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

module.exports = router;