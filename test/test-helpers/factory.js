const Task = require('../../src/models/task');

const createValidTask = async (task) => {
  const taskObj = Object.assign({}, task);
  taskObj._id = taskObj.id;
  await Task.create(taskObj);
};

module.exports = { createValidTask };
