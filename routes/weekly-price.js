const express = require('express');
const router = express.Router();
const { addWeeklyPrice, getWeeklyPrices, getWeeklyPrice, getWeeklyAveragePrice } = require('../controllers/WeeklyPriceController');

router.post('/', addWeeklyPrice);

router.get("/all", getWeeklyPrices);
router.get('/', getWeeklyPrice);
router.get('/average', getWeeklyAveragePrice)

module.exports = router;
