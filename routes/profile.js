const express = require('express');
const { updateUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/update', authMiddleware, updateUserProfile);

module.exports = router;