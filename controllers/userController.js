const db = require('../config/db');

const getAllUser = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * 
            FROM users
        `);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
};

module.exports = {
    getAllUser,
};