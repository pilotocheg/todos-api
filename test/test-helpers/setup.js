const mongoose = require('mongoose');
const timekeeper = require('timekeeper');
const dbconnect = require('../../src/db/db-connect');

let isConnected = false;

const connect = async () => {
  if (isConnected) return;
  await dbconnect;
  isConnected = true;
};

const clearAll = () => mongoose.connection.dropDatabase();

const configureTests = async () => {
  await connect();
  await clearAll();
  timekeeper.freeze(new Date(2018, 7, 16));
};

module.exports = configureTests;
