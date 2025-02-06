const express = require('express');
const router = express.Router();
const { getDailySensorData, getMonthlySensorData, getSensorDataEvery30Minutes, getSensorDataEvery30Seconds } = require('../controllers/sensorController');

router.post('/daily', getDailySensorData);

router.post('/monthly', getMonthlySensorData);

router.post('/30minutes', getSensorDataEvery30Minutes);

router.post('/30seconds', getSensorDataEvery30Seconds);

module.exports = router;
