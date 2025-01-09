const express = require('express');
const router = express.Router();
const { addWeeklyPrice, getWeeklyPrices, getWeeklyPrice } = require('../controllers/WeeklyPriceController');

// 📝 Add Weekly Prices
router.post('/', addWeeklyPrice);

// 📊 Get Weekly Prices
router.get('/prices', getWeeklyPrices);
router.get('/', getWeeklyPrice);

module.exports = router;
