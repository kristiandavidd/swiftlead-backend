const db = require('../config/db');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

exports.createHarvestSale = async (req, res) => {
    const { user_id, province, price, bowl_weight, oval_weight, corner_weight, broken_weight, appointment_date } = req.body;
    const proof_photo = req.file ? `/uploads/harvest/${req.file.filename}` : null;

    console.log('Creating harvest sale:', req.body);

    try {
        await db.query(
            `INSERT INTO harvest_sales (user_id, province, price, bowl_weight, oval_weight, corner_weight, broken_weight, appointment_date, proof_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, province, price, bowl_weight, oval_weight, corner_weight, broken_weight, appointment_date, proof_photo]
        );
        res.status(201).json({ message: 'Harvest sale created successfully' });
    } catch (error) {
        console.error('Error creating harvest sale:', error);
        res.status(500).json({ error: 'Failed to create harvest sale' });
    }
};


// Fetch Sales
exports.getSales = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT * FROM harvest_sales ORDER BY created_at DESC`);
        res.json(result);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};

exports.getSalesById = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(`SELECT * FROM harvest_sales WHERE id = ?`, [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching sale by ID:', error);
        res.status(500).json({ error: 'Failed to fetch sale by ID' });
    }
};

// controllers/salesController.js
exports.updateSaleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (![0, 1, 2, 3, 4, 5].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        await db.query("UPDATE harvest_sales SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Sale status updated successfully" });
    } catch (error) {
        console.error("Error updating sale status:", error);
        res.status(500).json({ error: "Failed to update sale status" });
    }
};


exports.getSalesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const [result] = await db.query(
            `SELECT * FROM harvest_sales WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching sales by user ID:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};
