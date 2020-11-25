const controller = require("../controller/Controller");
const express = require('express');
const router = express.Router();
const path = require('path');


router
    .get('/', async (request, response) => {
        try {
            const navn = request.session.navn;
            let user = await controller.getUser(navn)
            if (user[0].admin) {
                response.sendFile(path.join('C:\\Users\\Rasmus\\Desktop\\Sum Projekt\\SUMProjekt_Gruppe7\\public\\html\\admin.html'))
            } 
            else {
               
            }
        } catch (e) {
            sendStatus(e, response);
        }
    })


function sendStatus(e, response) {
    console.error("Exception: " + e);
    if (e.stack) console.error(e.stack);
    response.status(500).send(e);
}

module.exports = router;