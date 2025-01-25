const express = require('express');
const router = express.Router();
const { addWeeklyPrice, getWeeklyPrices, getWeeklyPrice, getWeeklyAveragePrice } = require('../controllers/WeeklyPriceController');

// 📝 Add Weekly Prices
router.post('/', addWeeklyPrice);

// 📊 Get Weekly Prices
router.get("/all", getWeeklyPrices);
router.get('/', getWeeklyPrice);
router.get('/average', getWeeklyAveragePrice)

module.exports = router;
