const { ObjectId } = require('mongoose').Types;
const Task = require('../models/task');

const errResponce = (res, stat, msg) => {
  res.status(stat).json({ code: stat, message: msg });
};

module.exports = {
  async readTask(req, res) {
    if (!ObjectId.isValid(req.params.id)) return errResponce(res, 400, 'wrong id');
    try {
      const doc = await Task.findById(req.params.id);
      if (!doc) return errResponce(res, 404, 'Task not found');
      return res.status(200).json(doc);
    } catch (err) {
      return errResponce(res, 500, err.message);
    }
  },
  async recordNew(req, res) {
    const reqObject = Object.assign({}, req.body);
    if (!Object.keys(reqObject).length) return errResponce(res, 400, "you don't pass any data");
    if (reqObject.id) reqObject._id = reqObject.id;
    if (!reqObject.timestamp) reqObject.timestamp = new Date();
    try {
      const savedTask = await Task.create(reqObject);
      return res.status(201).json(savedTask);
    } catch (err) {
      if (err.name === 'ValidationError') return errResponce(res, 400, err.message);
      if (err.code === 11000) return errResponce(res, 409, err.message);
      return errResponce(res, 500, err.message);
    }
  },
  async updateCurrent(req, res) {
    if (!ObjectId.isValid(req.params.id)) return errResponce(res, 400, 'wrong id');
    const reqObject = Object.assign({}, req.body);
    if (!Object.keys(reqObject).length) return errResponce(res, 400, "you don't pass any data");
    try {
      Task.isForbiddenParams(reqObject);
    } catch (e) {
      return errResponce(res, 403, `You try to update forbidden parameter ${e.message}`);
    }
    try {
      const doc = await Task.findById(req.params.id);
      if (!doc) return errResponce(res, 404, 'Task not found');
      Object.assign(doc, reqObject);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      if (err.name === 'ValidationError') return errResponce(res, 400, err.message);
      return errResponce(res, 500, err.message);
    }
  },
  async deleteRecord(req, res) {
    if (!ObjectId.isValid(req.params.id)) return errResponce(res, 400, 'wrong id');
    try {
      const doc = await Task.findById(req.params.id);
      if (!doc) return errResponce(res, 404, 'Task not found');
      await doc.remove();
      return res.status(204).send();
    } catch (err) {
      return errResponce(res, 500, err.message);
    }
  },
  async allCreated(req, res) {
    const params = { sort: { timestamp: 'desc' } };
    Task.checkQueryParams(req.query, params);
    try {
      const allTasks = await Task.find({}, null, params);
      return res.status(200).json(allTasks);
    } catch (err) {
      return errResponce(res, 500, err.message);
    }
  },
};
