const bcrypt = require('bcryptjs');
const db = require('../config/db');

const saltRounds = 10;

const register = (req, res) => {
    const { username, email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database query error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            db.query('INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting user into database:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    res.status(201).json({ message: 'User registered successfully!' });
                }
            );
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database query error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        res.status(200).json({ message: 'Login successful', user: { email: user.email } });
    });
};

module.exports = { register, login };
