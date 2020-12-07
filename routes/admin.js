const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const {
    hashIt
} = require("../app");

router
    .get('/', async (request, response) => {
        try {
            const navn = request.session.navn;
            if (navn && request.session.admin) {
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
            let { username, password, admin } = request.body;
            const saltRounds = 10;
            let hashedPassword = bcrypt.hashSync(password, saltRounds);
            let created = await controller.createUser(username, hashedPassword, admin);
            response.send({ message: 'User saved!', created });
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .post('/users/update/:userId', async (request, response) => {
        try {
            let { username, password, admin } = request.body;
            
            const saltRounds = 10;
            let hashedPassword = bcrypt.hashSync(password, saltRounds);

            let updatedUser = await controller.updateUser(request.params.userId, username, hashedPassword, admin);
            response.send({ message: 'User updated!', updatedUser })
        } catch (e) {
            sendStatus(e, response);
        }
        response.sendStatus(200)
    })
    .delete('/users/:id', async (request, response) => {
        try {
            let deleted = await controller.deleteUser(request.params.id);
            response.send({ message: 'User deleted!', deleted });
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