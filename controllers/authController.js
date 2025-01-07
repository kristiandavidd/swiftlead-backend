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
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the database
        const [insertResult] = await db.query(
            'INSERT INTO users ( email, name, password) VALUES (?, ?, ?)',
            [email, name, hashedPassword]
        );

        // Retrieve the newly created user
        const [newUserResult] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
        const newUser = newUserResult[0];

        // Generate JWT token
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
            message: 'User registered successfully!',
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
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Cek apakah pengguna ada di database
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result[0];

        // Cek status user (-1 = inactive)
        if (user.status === -1) {
            return res.status(403).json({
                message: 'Your account is inactive. Please contact support to activate your account.',
            });
        }

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Buat token JWT
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

        // Kirim respons sukses
        res.status(200).json({
            message: 'Login successful',
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
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

module.exports = { register, login, logout };
