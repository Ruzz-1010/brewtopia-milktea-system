const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE product (Admin only)
router.post('/', async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: req.body.image,
      description: req.body.description,
      category: req.body.category,
      customizations: req.body.customizations || {
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
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        description: req.body.description,
        category: req.body.category
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;