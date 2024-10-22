const db = require('../config/db');

const getDailySensorData = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT HOUR(timestamp) as hour, AVG(suhu) as avgSuhu, AVG(kelembapan) as avgKelembapan 
            FROM sensor 
            WHERE DATE(timestamp) = CURDATE()
            GROUP BY HOUR(timestamp)
        `);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Error fetching daily sensor data' });
    }
};

const getMonthlySensorData = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DATE(timestamp) as date, AVG(suhu) as avgSuhu, AVG(kelembapan) as avgKelembapan 
            FROM sensor 
            WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            GROUP BY DATE(timestamp)
        `);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Error fetching monthly sensor data' });
    }
};


module.exports = {
    getDailySensorData,
    getMonthlySensorData,
};
