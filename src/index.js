// Author: Vibhav Deo
// Description: A connecting server between dialogflow and facebook app messenger

const express = require('express');
const bodyParser = require('body-parser');
const verifyWebhook = require('./verify-webhook');
require('dotenv').config({ path: 'variables.env' });

const messageWebhook = require('./message-webhook');

    
const app = express();
app.use(bodyParser.json());
var http = require('http').Server(app)
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
console.log('In Index file');
app.get('/', verifyWebhook);
console.log('Verify webhook complete')
app.post('/', messageWebhook);
var server = http.listen(8002, function () {
    console.log('Server is listening on port', server.address().port);
});

