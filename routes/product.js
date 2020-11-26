const controller = require("../controller/Controller");
const express = require('express');
const { create } = require("../models/Order");
const router = express.Router();
const session= require('express-session');

router
    .get('/', async (request, response) => {
        try {
            let products = await controller.getProducts();
            response.send(products);
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .post('/', async (request, response) => {
        try {
            let { name, price, category } = request.body;
            let created = await controller.createProduct(name, price, category);
            response.send({ message: 'Product saved!', created });
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(201)
    }).post('/update/:productId', async (request, response) => {
        try {
            let { name, price, category } = request.body;
            let updatedProduct = await controller.updateProduct(request.params.productId, name, price, category);
            response.send({ message: 'Product updated!', updatedProduct })
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(200)
    })
    .delete('/:id', async (request, response) => {
        try {
            await controller.deleteProduct(request.params.id);
            response.send({ message: 'Product deleted!', id: request.params.id });
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(200)
    });

function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;