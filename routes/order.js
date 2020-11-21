const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();


router
    .get('/', async (request, response) => {
        try {
            let orders = await controller.getOrders();
            response.send(orders);
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .post('/', async (request, response) => {
        try {
            let { time, table, waiter, products, price, comment } = request.body;
            let createdOrder = await controller.createOrder(time, table, waiter, products, price, comment);
            response.send({ message: 'Order saved!', createdOrder });
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(201)
    })
    .post('/update/:orderID', async (request, response) => {
        try {
            let { products, price, comment } = request.body;
            let updatedOrder = await controller.updateOrder(request.params.orderID, products, price, comment);
            response.send({ message: 'Order updated!', updatedOrder })
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(200)
    })
    .delete('/:orderID', async (request, response) => {
        try {
            await controller.deleteOrder(request.params.orderID)
            response.send({ message: 'Order deleted!' });
        } catch (e) {
            sendStatus(e, response);
        }
    });

function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;