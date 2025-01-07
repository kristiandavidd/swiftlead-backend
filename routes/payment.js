const express = require('express');
const router = express.Router();
const { createMembershipPayment, handlePaymentNotification } = require('../controllers/paymentController');

router.post('/create', createMembershipPayment);
router.post('/notification', handlePaymentNotification);

module.exports = router;
