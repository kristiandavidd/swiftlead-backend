const midtransClient = require('midtrans-client');
const db = require('../config/db');
const moment = require('moment');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});


exports.createMembershipPayment = async (req, res) => {
    const { user_id, email, name, duration, price } = req.body;

    try {
        const orderId = `MEM-${Date.now()}`;

        const startDate = moment().format('YYYY-MM-DD');
        const endDate = moment().add(duration, 'months').format('YYYY-MM-DD');

        const transactionParams = {
            transaction_details: {
                order_id: orderId,
                gross_amount: price,
            },
            customer_details: {
                email,
                first_name: name,
            },
            callbacks: {
                finish: `${process.env.BASE_URL}/member/success`
            }
        };

        const transaction = await snap.createTransaction(transactionParams);

        await db.query(
            `INSERT INTO membership (id_user, order_id, join_date, exp_date, status) VALUES (?, ?, ?, ?, ?)`,
            [user_id, orderId, startDate, endDate, 1] 
        );

        res.status(200).json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });
    } catch (error) {
        console.error('Error creating membership payment:', error);
        res.status(500).json({ error: 'Gagal membuat pembayaran membership.' });
    }
};

exports.handlePaymentNotification = async (req, res) => {
    const notification = req.body;

    try {
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log("Midtrans Notification:", notification);

        if (transactionStatus === "capture" || transactionStatus === "settlement") {
            await db.query(
                `UPDATE membership SET status = 1 WHERE order_id = ?`,
                [orderId]
            );
        } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
            await db.query(
                `UPDATE membership SET status = -1 WHERE order_id = ?`,
                [orderId]
            );
        }

        res.status(200).json({ message: "Notifikasi berhasil diproses." });
    } catch (error) {
        console.error("Error processing notification:", error);
        res.status(500).json({ error: "Gagal dalam memproses notifikasi." });
    }
};

