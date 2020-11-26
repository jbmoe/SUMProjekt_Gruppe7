const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();
const path = require('path');
const session = require('express-session');

router
    .get('/', async (request, response) => {
        try {
            const navn = request.session.navn;
            let user = await controller.getUser(navn)
            if (navn && user[0].admin) {
                response.sendFile(path.resolve('public', 'html', 'admin.html'))
            }
            else {
                response.send('<h1> Pil af din reje </h1><a href="/bestilling"> Gå tilbage</a>')
            }
        } catch (e) {
            sendStatus(e, response);
        }
    })

    .get('/users', async (request, response) => {
        try {
            let users = await controller.getUsers()
            response.send(users)
        } catch (e) {
            sendStatus(e, response);
        }
    })


    .post('/', async (request, response) => {
        try {
            let {username, password, admin } = request.body;
            let created = await controller.createUser(username, password, admin);
            response.send({ message: 'User saved!', created });
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(201)
    })



function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;