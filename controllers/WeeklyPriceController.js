const db = require('../config/db');
const moment = require('moment');
const momentTimezone = require('moment-timezone');

exports.addWeeklyPrice = async (req, res) => {
    const { prices, week_start, week_end } = req.body;

    if (!week_start || !week_end || !Array.isArray(prices)) {
        return res.status(400).json({ message: 'Data masukan tidak valid.' });
    }

    try {
        for (const price of prices) {
            await db.query(
                `INSERT INTO weekly_birdnest_prices (province, price, week_start, week_end) VALUES (?, ?, ?, ?)`,
                [price.province, price.price, week_start, week_end]
            );
        }

        res.status(201).json({ message: 'Data acuan berhasil ditambahkan.' });
    } catch (err) {
        console.error('Error adding weekly prices:', err);
        res.status(500).json({ error: 'Gagal menambahkan data acuan.' });
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
            return res.status(404).json({ message: 'Belum data acuan pada minggu ini.' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching weekly prices:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data acuan.' });
    }
};


exports.getWeeklyPrices = async (req, res) => {
    try {
        const now = momentTimezone.tz("Asia/Jakarta");

        const startOfWeek = now.clone().startOf("week"); 
        const endOfWeek = now.clone().endOf("week"); 

        const startDate = startOfWeek.format("YYYY-MM-DD");
        const endDate = endOfWeek.format("YYYY-MM-DD");

        console.log("Today (WIB):", now.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Start of Week (WIB):", startDate);
        console.log("End of Week (WIB):", endDate);

        const query = `
            SELECT * FROM weekly_birdnest_prices
            WHERE week_start = ? AND week_end = ?
        `;
        const [results] = await db.query(query, [startDate, endDate]);

        if (results.length === 0) {
            return res.status(404).json({
                message: "Belum ada data acuan pada minggu ini.",
                startDate,
                endDate,
            });
        }

        res.status(200).json({
            message: "Data acuan berhasil didapatkan.",
            data: results,
            startDate,
            endDate,
        });
    } catch (error) {
        console.error("Error fetching weekly prices:", error);
        res.status(500).json({ message: "Gagal mendapatkan data acuan minggu ini." });
    }
};

exports.getWeeklyAveragePrice = async (req, res) => {
    const today = moment().format('YYYY-MM-DD'); 

    try {
        const [result] = await db.query(`
            SELECT price 
            FROM weekly_birdnest_prices 
            WHERE ? BETWEEN week_start AND week_end
        `, [today]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Tidak ada data harga untuk minggu ini.' });
        }

        const totalPrice = result.reduce((total, row) => total + parseFloat(row.price), 0);
        const averagePrice = totalPrice / result.length;

        res.json({ averagePrice: averagePrice.toFixed(2) });
    } catch (error) {
        console.error('Error fetching weekly prices:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data harga mingguan.' });
    }
};


