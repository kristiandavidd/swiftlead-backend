const express = require('express');
const router = express.Router();
const {
    getTransactionById,
    handleWebhook,
    getAllTransactions,
    getTransactionStatus,
    saveTransaction,
} = require('../controllers/transactionController');

// Endpoint untuk mengambil transaksi tertentu
router.get('/:orderId', getTransactionById);

// Endpoint webhook Midtrans
router.post('/webhook/midtrans', handleWebhook);

// Endpoint untuk mengambil semua transaksi
// router.get('/', getAllTransactions);

// Endpoint untuk mendapatkan status transaksi dari Midtrans
router.get("/:order_id/status", getTransactionStatus);

// Endpoint untuk menyimpan transaksi dari webhook Midtrans
router.post("/webhook", saveTransaction);

// Endpoint untuk mendapatkan daftar transaksi dari database
router.get("/", getAllTransactions);

module.exports = router;
