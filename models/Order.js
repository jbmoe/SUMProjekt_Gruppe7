// Order.js
const mongoose = require('mongoose');

const order = new mongoose.Schema({
    time: Number,
    table: String,
    waiter: String,
    products: String,
    price: String,
    comment: String
});

module.exports = mongoose.model('Order', order);