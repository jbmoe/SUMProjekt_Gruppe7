const express = require('express');
const router = express.Router();

router
    .get('/', async (request, response) => {
        request.session.destroy((err) => {
            if (err) {
                console.log(err)
            } else {
                response.redirect('/')
            }
        })
    })

module.exports = router;