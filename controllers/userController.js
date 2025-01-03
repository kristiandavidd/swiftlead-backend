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

// const updateUser = async (req, res) => {
//     try {
//         const userId = req.user.id; // Mendapatkan ID pengguna dari middleware autentikasi
//         const { name, no_telp, location } = req.body;

//         // Membuat objek pembaruan dinamis
//         const updates = {};
//         if (name) updates.name = name;
//         if (no_telp) updates.no_telp = no_telp;
//         if (location) updates.location = location;

//         // Jika tidak ada data yang dikirimkan
//         if (Object.keys(updates).length === 0) {
//             return res.status(400).json({ message: 'No fields to update' });
//         }

//         // Update data di database
//         const [result] = await db.query(
//             'UPDATE users SET ? WHERE id = ?',
//             [updates, userId]
//         );

//         if (result.affectedRows > 0) {
//             // Mengambil data pengguna terbaru
//             const [updatedUser] = await db.query(
//                 'SELECT id, name, no_telp, location, img_profile FROM users WHERE id = ?',
//                 [userId]
//             );
//             return res.status(200).json({
//                 message: 'User updated successfully',
//                 user: updatedUser[0],
//             });
//         } else {
//             return res.status(404).json({ message: 'User not found' });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (![0, 1].includes(role)) {
        return res.status(400).json({ message: 'Invalid role value. Use 0 (User) or 1 (Admin).' });
    }

    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Role updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Membership User
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status (hanya -1, 0, atau 1 yang diizinkan)
    if (![-1, 0, 1].includes(status)) {
        return res.status(400).json({ message: 'Invalid account status.' });
    }

    try {
        // Periksa apakah password user masih NULL
        const [user] = await db.query('SELECT password FROM users WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user[0].password && status !== -1) {
            return res.status(400).json({
                message: 'Cannot change user status. User password is not set.'
            });
        }

        // Lakukan pembaruan status jika validasi lolos
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Membership updated successfully' });
    } catch (err) {
        console.error('Error updating membership:', err);
        res.status(500).json({ error: err.message });
    }
};


const createUser = async (req, res) => {
    const { name, email, no_telp, location, role, status } = req.body;

    if (!name || !email || !no_telp || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await db.query(
            `INSERT INTO users (name, email, no_telp, location, role, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, no_telp, location, role || 0, status || 0]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

// 📝 Update User
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, no_telp, location, role, status } = req.body;

    try {
        await db.query(
            `UPDATE users SET name = ?, email = ?, no_telp = ?, location = ?, role = ?, status = ? WHERE id = ?`,
            [name, email, no_telp, location, role || 0, status || 0, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🗑️ Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM users WHERE id = ?`, [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `SELECT * FROM users WHERE id = ?`;
        const results = await db.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).send({ message: 'User not found' });
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
    getUserById
};