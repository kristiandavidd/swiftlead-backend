const midtransClient = require('midtrans-client');
const db = require('../config/db');
const axios = require('axios');

const coreApi = new midtransClient.CoreApi({
    isProduction: false, 
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

exports.getTransactionById = async (req, res) => {
    const { orderId } = req.params;
    try {
        const transaction = await coreApi.transaction.status(orderId);
        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data transaksi.' });
    }
};

exports.handleWebhook = async (req, res) => {
    const notification = req.body;

    try {
        const { order_id, transaction_status, gross_amount, payment_type, transaction_time } = notification;

        const sql = `
            INSERT INTO transactions (order_id, status, amount, payment_type, transaction_time)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status = ?, payment_type = ?, transaction_time = ?;
        `;
        await db.query(sql, [
            order_id,
            transaction_status,
            gross_amount,
            payment_type,
            transaction_time,
            transaction_status,
            payment_type,
            transaction_time,
        ]);

        res.json({ message: 'Webhook berhasil diproses.' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Gagal dalam memproses webhook' });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const sql = 'SELECT * FROM transactions ORDER BY transaction_time DESC';
        const [rows] = await db.query(sql);
        console.log([rows])
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data transaksi.' });
    }
};

const apiUrl = "https://api.sandbox.midtrans.com/v2";

exports.getTransactionStatus = async (req, res) => {
    const { order_id } = req.params;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const base64Key = Buffer.from(`${serverKey}:`).toString("base64");

    try {
        const response = await axios.get(`${apiUrl}/${order_id}/status`, {
            headers: {
                Authorization: `Basic ${base64Key}`,
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching transaction status:", error);
        res.status(500).json({ message: "Gagal mendapatkan data status transaksi." });
    }
};

exports.saveTransaction = async (req, res) => {
    try {
        const {
            order_id,
            transaction_status,
            gross_amount,
            payment_type,
            transaction_time,
        } = req.body;

        await db.query(
            `
            INSERT INTO transactions(order_id, status, amount, payment_type, transaction_time)
            VALUES(?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                amount = VALUES(amount),
                payment_type = VALUES(payment_type),
                transaction_time = VALUES(transaction_time);
        `,
            [order_id, transaction_status, gross_amount, payment_type, transaction_time]
        );

        res.status(201).json({ message: "Transaksi berhasil disimpan." });
    } catch (error) {
        console.error("Error saving transaction:", error);
        res.status(500).json({ message: "Gagal dalam menyimpan data transaksi." });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query("SELECT * FROM transactions ORDER BY transaction_time DESC");
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Gagal dalam mendapatkan data transaksi." });
    }
};