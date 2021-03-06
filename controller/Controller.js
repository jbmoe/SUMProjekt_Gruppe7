const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product')
const PaidOrder = require('../models/PaidOrder')
const User = require('../models/User')
const config = require('../config');

mongoose.connect(config.databaseURI, { useNewUrlParser: true, useUnifiedTopology: true })

exports.createUser = function (username, password, admin) {
    return User.create({
        username,
        password,
        admin
    })
}

exports.updateUser = async function (id, username, password, admin) {
    const filter = { _id: id }
    const updatedUser = { username, password, admin }
    return await User.findOneAndUpdate(filter, updatedUser, { new: true })
}

exports.deleteUser = async function (userId) {
    return await User.deleteOne().where('_id').eq(userId).exec()
};

exports.getUser = async function (username) {
    return User.findOne({ username }).exec()
};

exports.getUsers = function () {
    return User.find().populate('Users').exec();
};

exports.createProduct = function (name, price, category) {
    return Product.create({
        name,
        price,
        category
    });
};

exports.updateProduct = async function (id, name, price, category) {
    const filter = { _id: id }
    const updatedProduct = { name, price, category }
    return await Product.findOneAndUpdate(filter, updatedProduct, { new: true })
}

exports.getProduct = function (productId) {
    return Product.findById(productId).exec();
};

exports.getProducts = function () {
    return Product.find().populate('Products').exec();
};

exports.deleteProduct = async function (productId) {
    return await Product.deleteOne().where('_id').eq(productId).exec()
};

exports.createOrder = function (time, table, waiter, products, price, comment) {
    return Order.create({
        time,
        table,
        waiter,
        products,
        price,
        comment
    });
};

exports.getOrder = function (orderID) {
    return Order.findById(orderID).exec();
};

exports.getOrders = function () {
    return Order.find().populate('UnpaidOrders').exec();
};

exports.updateOrder = async function (id, products, price, comment) {
    const filter = { _id: id }
    const update = { products: products, price: price, comment: comment }
    return await Order.findOneAndUpdate(filter, update)
}

exports.deleteOrder = async function (orderID) {
    return await Order.deleteOne().where('_id').eq(orderID).exec()
};

exports.createPaidOrder = async function (order, paymentMethod) {
    return await PaidOrder.create({
        order,
        paymentMethod
    })
}

exports.getPaidOrders = function () {
    return PaidOrder.find().populate('PaidOrders').exec();
}