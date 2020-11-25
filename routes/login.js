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
        const { navn, password } = request.body;
        let user = controller.getUser(navn)
        if (password === user.password && navn) {
            request.session.navn = navn;
            response.status(201).send(['login ok!']);
        } else {
            response.sendStatus(401);
        }
    });

    module.exports = router;