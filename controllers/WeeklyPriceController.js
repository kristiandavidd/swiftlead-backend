// controllers/weeklyPriceController.js

const db = require('../config/db');
const moment = require('moment');

// 📝 Add Weekly Price
exports.addWeeklyPrice = async (req, res) => {
    const { prices, week_start, week_end } = req.body;

    if (!week_start || !week_end || !Array.isArray(prices)) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        // Masukkan data harga untuk setiap provinsi
        for (const price of prices) {
            await db.query(
                `INSERT INTO weekly_birdnest_prices (province, price, week_start, week_end) VALUES (?, ?, ?, ?)`,
                [price.province, price.price, week_start, week_end]
            );
        }

        res.status(201).json({ message: 'Weekly prices added successfully' });
    } catch (err) {
        console.error('Error adding weekly prices:', err);
        res.status(500).json({ error: 'Failed to add weekly prices' });
    }
};

exports.getWeeklyPrice = async (req, res) => {
    const { province } = req.query;
    const today = moment().format('YYYY-MM-DD');

    try {
        const [result] = await db.query(`
            SELECT * 
            FROM weekly_birdnest_prices 
            WHERE province = ? 
                AND ? BETWEEN week_start AND week_end
        `, [province, today]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No price data available for this week.' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching weekly prices:', error);
        res.status(500).json({ error: 'Failed to fetch weekly price' });
    }
};

exports.getWeeklyPrices = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM weekly_birdnest_prices ORDER BY week_start DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching weekly prices:', err);
        res.status(500).json({ error: 'Failed to fetch weekly prices' });
    }
};
