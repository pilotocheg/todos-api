require('dotenv').config();
const envCheck = require('./utils');

module.exports = {
  PORT: envCheck('PORT', 3000),
  MONGO_URL: envCheck('MONGO_URL', 'mongodb://localhost:27017'),
};
