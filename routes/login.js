const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();
const session= require('express-session');


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
        const { navn, password } = request.body;
        let user = await controller.getUser(navn)
        if (password === user[0].password && navn) {
            request.session.navn = navn;
            request.session.admin = user[0].admin
            // response.status(201).send(['login ok!']);
            response.send(user)
        } else {
            // response.send({navn, password});
            response.send(user.password)
        }
    });


function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;