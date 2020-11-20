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
            await controller.createOrder(time, table, waiter, products, price, comment);
            response.send({ message: 'Order saved!' });
        } catch (e) {
            sendStatus(e, response);
        }
        // response.sendStatus(201)
    }
    )
    .post('/payment', async (request, response) => {
        try {
            let {order, paymentMethod} = request.body;
            await controller.createOrder(order, paymentMethod);
            response.send({ message: 'Order paid!' });
        } catch (e) {
            // sendStatus(e, response);
        }
    }
    )
    .post('/update/:orderID', async (request, response) => {
        try {
            let { products, price, comment } = request.body;
            let update = await controller.updateOrder(request.params.orderID, products, price, comment);
            response.send({ message: 'Order saved!' })
        } catch (e) {
            // sendStatus(e, response);
        }
        // response.sendStatus(201)
    }
    )
    .delete('/:orderID', async (request, response) => {
        try {
            await controller.deleteOrder(request.params.orderID)
            response.send({ message: 'Order deleted!' });
        } catch (e) {
            sendStatus(e, response);
        }
    }
    );



// function sendStatus(e, response) {
//     console.error("Exception: " + e);
//     if (e.stack) console.error(e.stack);
//     response.status(500).send(e);
// }

module.exports = router;

