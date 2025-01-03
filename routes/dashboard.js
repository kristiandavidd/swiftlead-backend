const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', authMiddleware, (req, res) => {
    console.log('User:', req.user);
    res.json({ message: 'Welcome to your dashboard!', user: req.user });
});

module.exports = router;
