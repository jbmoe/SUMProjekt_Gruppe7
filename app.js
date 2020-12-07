// app.js
const express = require('express');
const session = require('express-session');
const app = express();
const config = require('./config');
const bcrypt = require('bcrypt');

app.use(express.static('public'));
app.use(express.static('public/html'));
app.use(express.json());
app.use(session({ secret: 'hemmelig', saveUninitialized: true, resave: true }));
app.use('/api/products', require('./routes/product'));
app.use('/bestilling', require('./routes/order'));
app.use('/login', require('./routes/login'))
app.use('/logout', require('./routes/logout'))
app.use('/admin', require('./routes/admin'))


const port = process.env.PORT || config.localPort; // Heroku
app.listen(port);
console.log('Listening on port ' + port + ' ...');

module.exports = app; 