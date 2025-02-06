const db = require('../config/db');

const getDailySensorData = async (req, res) => {
    const { install_code } = req.body;

    if (!install_code) {
        return res.status(400).json({ error: "install_code diperlukan" });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(MIN(timestamp), '%Y-%m-%d %H:00:00') AS time_label, 
                AVG(suhu) as avgSuhu, 
                AVG(kelembaban) as avgKelembaban 
            FROM sensor 
            WHERE timestamp >= NOW() - INTERVAL 24 HOUR AND install_code = ?
            GROUP BY FLOOR(UNIX_TIMESTAMP(timestamp) / 3600)
            ORDER BY time_label ASC;
        `, [install_code]);

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data harian' });
    }
};

const getMonthlySensorData = async (req, res) => {
    const { install_code } = req.body;

    if (!install_code) {
        return res.status(400).json({ error: "install_code diperlukan" });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(timestamp, '%Y-%m') AS date, 
                AVG(suhu) AS avgSuhu, 
                AVG(kelembaban) AS avgKelembaban
            FROM sensor 
            WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) 
                AND install_code = ?
            GROUP BY date
            ORDER BY date ASC;
        `, [install_code]);

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data bulanan' });
    }
};

const getSensorDataEvery30Minutes = async (req, res) => {
    const { install_code } = req.body;

    if (!install_code) {
        return res.status(400).json({ error: "install_code diperlukan" });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(MIN(timestamp), '%Y-%m-%d %H:%i:%s') AS time_label, 
                AVG(suhu) as avgSuhu, 
                AVG(kelembaban) as avgKelembaban 
            FROM sensor 
            WHERE timestamp >= NOW() - INTERVAL 1 DAY AND install_code = ?
            GROUP BY FLOOR(UNIX_TIMESTAMP(timestamp) / (30 * 60))
            ORDER BY time_label ASC;
        `, [install_code]);

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data setiap 30 menit' });
    }
};

const getSensorDataEvery30Seconds = async (req, res) => {
    const { install_code } = req.body;

    if (!install_code) {
        return res.status(400).json({ error: "install_code diperlukan" });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(MIN(timestamp), '%Y-%m-%d %H:%i:%s') AS time_label, 
                AVG(suhu) as avgSuhu, 
                AVG(kelembaban) as avgKelembaban 
            FROM sensor 
            WHERE timestamp >= NOW() - INTERVAL 1 HOUR AND install_code = ?
            GROUP BY FLOOR(UNIX_TIMESTAMP(timestamp) / 30)
            ORDER BY time_label ASC;
        `, [install_code]);

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data setiap 30 detik' });
    }
};

module.exports = {
    getDailySensorData,
    getMonthlySensorData,
    getSensorDataEvery30Minutes,
    getSensorDataEvery30Seconds
};
