const db = require('../config/db');
const path = require('path');

// Tambah artikel
exports.createArticle = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = `INSERT INTO articles (title, content, cover_image, status) VALUES (?, ?, ?, ?)`;
        const result = await db.query(sql, [title, content, coverImage, status]);
        res.status(201).send({ id: result.insertId, message: 'Article created' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// Edit artikel
exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, cover_image: existingCover } = req.body;

        const coverImage = req.file ? `/uploads/${req.file.filename}` : existingCover;

        const sql = `UPDATE articles SET title = ?, content = ?, cover_image = ? WHERE id = ?`;
        await db.query(sql, [title, content, coverImage, id]);

        res.send({ message: 'Article updated' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};


// Hapus artikel
exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `DELETE FROM articles WHERE id = ?`;
        await db.query(sql, [id]);
        res.send({ message: 'Article deleted' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// Dapatkan semua artikel
exports.getAllArticles = async (req, res) => {
    try {
        const sql = `SELECT * FROM articles  ORDER BY created_at DESC`;
        const results = await db.query(sql);
        res.send(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.getAllPublishedArticles = async (req, res) => {
    try {
        const sql = `SELECT * FROM articles WHERE status = 1 ORDER BY created_at DESC`;
        const results = await db.query(sql);
        res.send(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// Dapatkan artikel berdasarkan ID
exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `SELECT * FROM articles WHERE id = ?`;
        const results = await db.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).send({ message: 'Article not found' });
        }
        res.send(results[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.updateArticleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi status (harus 0 atau 1)
        if (status !== 0 && status !== 1) {
            return res.status(400).send({ message: 'Invalid status. Use 0 for Draft or 1 for Published.' });
        }

        const sql = `UPDATE articles SET status = ? WHERE id = ?`;
        await db.query(sql, [status, id]);

        res.send({ message: 'Article status updated successfully' });
    } catch (err) {
        console.error('Error updating article status:', err);
        res.status(500).send({ error: err.message });
    }
};
