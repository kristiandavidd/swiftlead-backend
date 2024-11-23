const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin', (req, res) => {
    console.log('User:', req.user);
    res.json({ message: 'Welcome to your dashboard admin!', user: req.user });
});

module.exports = router;
