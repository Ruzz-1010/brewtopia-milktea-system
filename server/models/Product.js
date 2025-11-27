const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Milk Tea', 'Fruit Tea', 'Coffee', 'Specialty', 'Seasonal']
  },
  customizations: {
    sizes: [
      {
        name: String,
        price: Number
      }
    ],
    sugarLevels: [String],
    iceLevels: [String],
    addons: [
      {
        name: String,
        price: Number
      }
    ]
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);