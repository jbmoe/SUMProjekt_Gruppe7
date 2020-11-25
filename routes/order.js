const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();
const path = require('path');


router
    .get('/', async (request, response) => {
        try {
            const navn = request.session.navn;
            if (navn) {
                 //skift til din egen sti
                response.sendFile(path.join('C:\\Users\\Rasmus\\Desktop\\Sum Projekt\\SUMProjekt_Gruppe7\\public\\html\\bestilling.html'))
            } 
            else {
                response.redirect('/')
            }
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .get('/', async (request, response) => {
        try {
            const navn = request.session.navn;
            if (navn) {
                let orders = await controller.getOrders();
                response.send(orders);
            } 
            else {
                response.redirect('/')
            }
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
    }).post('/payment', async (request, response) => {
        try {
            let { order, paymentMethod } = request.body;
            await controller.createPaidOrder(order, paymentMethod);
            await controller.deleteOrder(order._id)
            response.send({ message: 'Order paid!' });
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .post('/update/:orderID', async (request, response) => {
        try {
            let { products, price, comment } = request.body;
            let updatedOrder = await controller.updateOrder(request.params.orderID, products, price, comment);
            response.send({ message: 'Order updated!', order: updatedOrder })
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(200)
    })
    .delete('/:orderID', async (request, response) => {
        try {
            let deleted = await controller.deleteOrder(request.params.orderID)
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