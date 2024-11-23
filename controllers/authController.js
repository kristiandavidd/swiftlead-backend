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

    const { email, password } = req.body;

    try {
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Server error' });
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
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { email: user.email, name: user.name, role: user.role, },
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
