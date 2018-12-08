const express = require('express');

const router = express.Router();
const tasks = require('../controllers/tasks');
const upTimeMonitoring = require('../controllers/uptime-monitoring');

router.get('/', upTimeMonitoring);
router.post('/todo', tasks.recordNew);
router.get('/todo/:id', tasks.readTask);
router.put('/todo/:id', tasks.updateCurrent);
router.delete('/todo/:id', tasks.deleteRecord);
router.get('/todos', tasks.allCreated);

module.exports = router;
