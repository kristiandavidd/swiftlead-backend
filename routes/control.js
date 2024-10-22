const express = require('express');
const router = express.Router();
const { getDailySensorData, getMonthlySensorData } = require('../controllers/sensorController');

router.get('/daily', getDailySensorData);

router.get('/monthly', getMonthlySensorData);

module.exports = router;
