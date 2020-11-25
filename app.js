// app.js
const express = require('express');
const app = express();
const config = require('./config');

app.use(express.static('public'));
app.use(express.static('public/html'));
app.use(express.json());
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/login', require('./routes/login'))


const port = process.env.PORT || config.localPort; // Heroku
app.listen(port);
console.log('Listening on port ' + port + ' ...');

module.exports = app; // testnpm