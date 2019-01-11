const mongoose = require('mongoose');
const { MONGO_URL } = require('../../config/index');

module.exports = mongoose.connect(
  MONGO_URL,
  { useNewUrlParser: true },
);
