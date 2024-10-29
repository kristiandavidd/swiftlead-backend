const bcrypt = require('bcryptjs');
const db = require('../config/db');

const saltRounds = 10;

const register = async (req, res) => {
    const { email, password } = req.body;
    console.log('Registering user:', req.body);

    try {
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.log('registration start...');

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('hashed password');

        const [insertResult] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        console.log('user inserted');

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    console.log('registration end...');
};


const login = async (req, res) => {
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

        res.status(200).json({ message: 'Login successful', user: { email: user.email } });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
