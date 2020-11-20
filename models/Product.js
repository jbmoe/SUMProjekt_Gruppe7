// Order.js
const mongoose = require('mongoose');

const product = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
});

module.exports = mongoose.model('Product', product, 'Products');