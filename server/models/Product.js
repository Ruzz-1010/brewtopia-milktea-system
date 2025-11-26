const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  description: String,
  category: String,
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
  }
});

module.exports = mongoose.model('Product', productSchema);