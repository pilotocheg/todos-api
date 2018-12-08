require('dotenv').config();
const envCheck = require('./utils');

module.exports = {
  PORT: envCheck('PORT', 3000),
  MONGO_URI: envCheck('MONGO_URI', 'mongodb://pilotocheg:Pilot122223@ds022228.mlab.com:22228/todosdb'),
};
