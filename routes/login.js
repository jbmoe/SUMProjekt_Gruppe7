const controller = require("../controller/Controller");
const express = require('express');
const bcrypt = require('bcrypt')
const router = express.Router();

router
    .get('/session', async (request, response) => {
        try {
            response.send(request.session)
        } catch (e) {
            sendStatus(e, response);
        }
    })
    .post('/', async (request, response) => {
        const { navn, password } = request.body;
        let user = await controller.getUser(navn)
        let hashPword = user.password
        bcrypt.compare(password, hashPword, async function (err, res) {
            if (res) {
                // Passwords match
                request.session.navn = navn;
                request.session.admin = user.admin
                response.send(request.session)
            } else {
                // Passwords don't match
            }
        });
    });


function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;