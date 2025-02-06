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
        res.status(500).json({ error: 'Gagal mendapatkan data pengguna.' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { name, no_telp, location } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (no_telp) updates.no_telp = no_telp;
        if (location) updates.location = location;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Data pengguna sudah terbaru.' });
        }

        const [result] = await db.query(
            'UPDATE users SET ? WHERE id = ?',
            [updates, userId]
        );

        if (result.affectedRows > 0) {
            const [updatedUser] = await db.query(
                'SELECT id, name, no_telp, location, img_profile FROM users WHERE id = ?',
                [userId]
            );
            return res.status(200).json({
                message: 'Profil pengguna berhasil diperbarui.',
                user: updatedUser[0],
            });
        } else {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Peladen mengalami galat.' });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (![0, 1].includes(role)) {
        return res.status(400).json({ message: 'Peran tidak valid.' });
    }

    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Peran berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (![-1, 0, 1].includes(status)) {
        return res.status(400).json({ message: 'Status akun tidak valid.' });
    }

    try {
        const [user] = await db.query('SELECT password FROM users WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        if (!user[0].password && status !== -1) {
            return res.status(400).json({
                message: 'Tidak bisa mengubah status pengguna. Password belum diatur.'
            });
        }

        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

        if (status === -1) {
            await db.query(
                `UPDATE membership SET status = 2 WHERE id_user = ?`,
                [id]
            );
        }

        res.json({ message: 'Status pengguna berhasil diperbarui.' });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    const { name, email, no_telp, location, role, status } = req.body;

    if (!name || !email || !no_telp || !location) {
        return res.status(400).json({ message: 'Semua bagian harus diisi.' });
    }

    try {
        await db.query(
            `INSERT INTO users (name, email, no_telp, location, role, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, no_telp, location, role || 0, status || 0]
        );
        res.status(201).json({ message: 'Pengguna berhasil ditambahkan.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, no_telp, location, role, status } = req.body;

    try {
        await db.query(
            `UPDATE users SET name = ?, email = ?, no_telp = ?, location = ?, role = ?, status = ? WHERE id = ?`,
            [name, email, no_telp, location, role || 0, status || 0, id]
        );

        if (status === -1) {
            await db.query(
                `UPDATE membership SET status = 2 WHERE id_user = ?`,
                [id]
            );
        }

        res.json({ message: 'Berhasil memperbarui pengguna.' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
};


const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM membership WHERE id_user = ?`, [id]);

        await db.query(`DELETE FROM users WHERE id = ?`, [id]);

        res.json({ message: 'Pengguna berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: err.message });
    }
};


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `SELECT * FROM users WHERE id = ?`;
        const results = await db.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).send({ message: 'Pengguna tidak ditemukan.' });
        }
        res.send(results[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

module.exports = {
    getAllUser,
    updateUser,
    updateUserStatus,
    updateUserRole,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    updateUserProfile
};