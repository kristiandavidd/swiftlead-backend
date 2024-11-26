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

const updateUser = async (req, res) => {
    try {
        const userId = req.user.id; // Mendapatkan ID pengguna dari middleware autentikasi
        const { name, no_telp, location } = req.body;

        // Membuat objek pembaruan dinamis
        const updates = {};
        if (name) updates.name = name;
        if (no_telp) updates.no_telp = no_telp;
        if (location) updates.location = location;

        // Jika tidak ada data yang dikirimkan
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Update data di database
        const [result] = await db.query(
            'UPDATE users SET ? WHERE id = ?',
            [updates, userId]
        );

        if (result.affectedRows > 0) {
            // Mengambil data pengguna terbaru
            const [updatedUser] = await db.query(
                'SELECT id, name, no_telp, location, img_profile FROM users WHERE id = ?',
                [userId]
            );
            return res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser[0],
            });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUser,
    updateUser
};