// Order.js
const mongoose = require('mongoose');

const paidOrder = new mongoose.Schema({
    order: String,
    paymentMethod: String
});

module.exports = mongoose.model('PaidOrder', paidOrder, "PaidOrders");