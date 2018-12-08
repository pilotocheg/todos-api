const Express = require('express');
const bodyParser = require('body-parser');
const cors = require('./api/middlewayers/cors');

const app = new Express();
const router = require('./api/router');

app.use(cors);
app.use(bodyParser.json());
app.use(router);

module.exports = app;
