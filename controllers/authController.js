const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validationResult } = require('express-validator');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'default-secret';

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    try {
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [insertResult] = await db.query(
            'INSERT INTO users ( email, name, password) VALUES (?, ?, ?)',
            [email, name, hashedPassword]
        );

        const [newUserResult] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
        const newUser = newUserResult[0];

        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                location: newUser.location,
                no_telp: newUser.no_telp,
                img_profile: newUser.img_profile,
                role: newUser.role,
            },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Pendaftaran pengguna berhasil!',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                location: newUser.location,
                no_telp: newUser.no_telp,
                img_profile: newUser.img_profile,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Peladen mengalami galat.' });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const user = result[0];

        if (user.status === -1) {
            return res.status(403).json({
                message: 'Akun anda tidak aktif. Hubungi admin untuk mengaktifkannya.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                location: user.location,
                no_telp: user.no_telp,
                img_profile: user.img_profile,
                role: user.role,
            },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Berhasil masuk.',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                location: user.location,
                no_telp: user.no_telp,
                img_profile: user.img_profile,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Peladen mengalami galat.' });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Berhasil keluar.' });
};

module.exports = { register, login, logout };
