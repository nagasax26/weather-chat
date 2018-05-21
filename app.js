const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

//env file config
require('dotenv').config();

//static file
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

//pages url
app.get('/', function (req, res) {
    res.sendFile('index');
});

//listening on port
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('server listening on port', port);
});