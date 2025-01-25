const db = require('../config/db');

// Ambil data membership
exports.getMemberships = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT m.id, u.name, u.email, m.join_date, m.exp_date, m.status
            FROM membership m
            JOIN users u ON m.id_user = u.id
        `);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ambil user yang memenuhi syarat untuk membership
// Ambil daftar pengguna yang memenuhi syarat untuk membership
exports.getEligibleUsers = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT id, name, email
            FROM users 
            WHERE status = 0 
                AND role = 0 
                AND id NOT IN (SELECT id_user FROM membership)
        `);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching eligible users:", error);
        res.status(500).json({ error: error.message });
    }
};

// Tambahkan pengguna ke membership
exports.addMembership = async (req, res) => {
    const { user_id, start_date, end_date } = req.body;
    try {
        // Periksa apakah user_id sudah ada di membership
        const [existing] = await db.query(`
            SELECT id_user FROM membership WHERE id_user = ?
        `, [user_id]);

        if (existing.length > 0) {
            return res.status(400).json({ message: "User is already a member." });
        }

        // Tambahkan user ke membership jika belum ada
        await db.query(`
            INSERT INTO membership (id_user, join_date, exp_date, status) 
            VALUES (?, ?, ?, ?)
        `, [user_id, start_date, end_date, 1]);

        res.status(201).json({ message: 'Membership added successfully' });
    } catch (error) {
        console.error("Error adding membership:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMembership = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM membership WHERE id = ?`, [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMembership = async (req, res) => {
    const { id } = req.params;
    const { join_date, exp_date, status } = req.body;

    try {
        // Validasi status
        if (![0, 1, 2].includes(parseInt(status))) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        await db.query(
            `UPDATE membership SET join_date = ?, exp_date = ?, status = ? WHERE id = ?`,
            [join_date, exp_date, status, id]
        );

        res.status(200).json({ message: 'Membership updated successfully' });
    } catch (error) {
        console.error('Error updating membership:', error);
        res.status(500).json({ error: 'Failed to update membership' });
    }
};

exports.getMembershipById = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            `SELECT m.id, m.join_date, m.exp_date, m.status, u.name, u.email 
                FROM membership m
                JOIN users u ON m.id_user = u.id
                WHERE m.id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'Membership not found' });
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching membership:', error);
        res.status(500).json({ error: 'Failed to fetch membership details' });
    }
};

exports.getMembershipStatusById = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            `SELECT id, status, join_date, exp_date, order_id
             FROM membership 
             WHERE id_user = ? 
               AND status = 1 
               AND CURDATE() BETWEEN join_date AND exp_date`,
            [id]
        );

        if (result.length === 0) {
            return res.status(200).json({ isActive: false, membership: null });
        }

        const membership = result[0];
        res.status(200).json({ isActive: true, membership });
    } catch (error) {
        console.error("Error fetching membership status:", error);
        res.status(500).json({ error: "Failed to fetch membership status" });
    }
};
