const express = require('express');
const router = express.Router();
const {
    getTransactionById,
    handleWebhook,
    getAllTransactions,
    getTransactionStatus,
    saveTransaction,
} = require('../controllers/transactionController');

router.get('/:orderId', getTransactionById);

router.post('/webhook/midtrans', handleWebhook);

router.get("/:order_id/status", getTransactionStatus);

router.post("/webhook", saveTransaction);

router.get("/", getAllTransactions);

module.exports = router;
