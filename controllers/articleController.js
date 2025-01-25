const db = require('../config/db');
const path = require('path');

// Tambah artikel
// Create Article
exports.createArticle = async (req, res) => {
    try {
        const { title, content, tags_id, status } = req.body;
        const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = `INSERT INTO articles (title, content, cover_image, tags_id, status) VALUES (?, ?, ?, ?, ?)`;
        const result = await db.query(sql, [title, content, coverImage, tags_id, status]);

        res.status(201).send({ id: result.insertId, message: "Article created" });
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.error('Error creating article:', err);
    }
};

// Update Article
exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status, tags_id, cover_image: existingCover } = req.body;
        const coverImage = req.file ? `/uploads/${req.file.filename}` : existingCover;

        const sql = `UPDATE articles SET title = ?, content = ?, status = ?, cover_image = ?, tags_id = ? WHERE id = ?`;
        await db.query(sql, [title, content, status, coverImage, tags_id, id]);

        res.send({ message: "Article updated" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const sql = `SELECT * FROM tags`;
        const results = await db.query(sql);
        res.send(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}


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
        const sql = `
            SELECT a.*, t.id as tag_id, t.name as tag_name
            FROM articles a, tags t
            WHERE t.id = a.tags_id
            ORDER BY created_at DESC
        `;
        const results = await db.query(sql);
        res.send(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.error('Error fetching articles:', err);
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

exports.getAllMembershipArticles = async (req, res) => {
    try {
        const sql = `SELECT * FROM articles WHERE status = 2 ORDER BY created_at DESC `;
        const results = await db.query(sql);
        res.send(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

// Dapatkan artikel berdasarkan ID
exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
                SELECT a.*, t.name as tag_name
                FROM articles a, tags t
                WHERE a.tags_id = t.id AND a.id = ?

        `
        const results = await db.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).send({ message: 'Artikel tidak ditemukan' });
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
        if (status !== 0 && status !== 1 && status !== 2) {
            return res.status(400).send({ message: 'Status tidak valid.' });
        }

        const sql = `UPDATE articles SET status = ? WHERE id = ?`;
        await db.query(sql, [status, id]);

        res.send({ message: 'Status artikel berhasil diperbarui.' });
    } catch (err) {
        console.error('Error memperbarui status artikel:', err);
        res.status(500).send({ error: err.message });
    }
};

// Get recommended articles
exports.getRecommendedArticles = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT * FROM articles
            WHERE id != ? AND tags_id = (
                SELECT tags_id FROM articles WHERE id = ?
            ) LIMIT 5
        `;
        const recommendations = await db.query(sql, [id, id]);
        res.json(recommendations);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get comments for an article
exports.getComments = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT comments.*, users.name as author
            FROM comments, users
            WHERE article_id = ? AND users.id = comments.user_id
            ORDER BY created_at DESC
        `;
        const comments = await db.query(sql, [id]);
        res.json(comments);
    } catch (error) {
        res.status(500).send({ error: error.message });
        console.log('Galat mendapatkan data komentar:', error);
    }
};

// Add a new comment
exports.addComment = async (req, res) => {
    try {
        const { id: article_id } = req.params; // ID artikel
        const { content, user_id } = req.body; // Isi komentar

        const sql = `INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)`;
        await db.query(sql, [article_id, user_id, content]);

        res.status(201).send({ message: "Komentar berhasil ditambahkan." });
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.error('Galat menambahkan komentar:', err);
    }
};

// DELETE /comments/:id
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params; // ID komentar
        const { user_id, user_role } = req.body;

        // Periksa apakah komentar ada dan milik pengguna
        const [comment] = await db.query(`SELECT user_id FROM comments WHERE id = ?`, [id]);

        if (!comment) {
            return res.status(404).send({ message: "Komentar tidak ditemukan." });
        }

        if (comment.user_id !== user_id && user_role !== 1) {
            return res.status(403).send({ message: "Anda tidak berhak menghapus komentar ini." });
        }

        await db.query(`DELETE FROM comments WHERE id = ?`, [id]);
        res.send({ message: "Komentar berhasil dihapus." });
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.log('Galat:', err);
    }
};


