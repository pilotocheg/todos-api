const mongoose = require('mongoose');
const { MONGO_URI } = require('../../config/index');

module.exports = mongoose.connect(MONGO_URI, { useNewUrlParser: true });
