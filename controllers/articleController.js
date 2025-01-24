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
        if (status !== 0 && status !== 1 && status !== 2) {
            return res.status(400).send({ message: 'Invalid status.' });
        }

        const sql = `UPDATE articles SET status = ? WHERE id = ?`;
        await db.query(sql, [status, id]);

        res.send({ message: 'Article status updated successfully' });
    } catch (err) {
        console.error('Error updating article status:', err);
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
        console.log('Error fetching comments:', error);
    }
};

// Add a new comment
exports.addComment = async (req, res) => {
    try {
        const { id: article_id } = req.params; // ID artikel
        const { content, user_id } = req.body; // Isi komentar

        const sql = `INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)`;
        await db.query(sql, [article_id, user_id, content]);

        res.status(201).send({ message: "Comment added successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.error('Error adding comment:', err);
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
            return res.status(404).send({ message: "Comment not found" });
        }

        if (comment.user_id !== user_id && user_role !== 1) {
            return res.status(403).send({ message: "Not authorized to delete this comment" });
        }

        await db.query(`DELETE FROM comments WHERE id = ?`, [id]);
        res.send({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
        console.log('Error deleting comment:', err);
    }
};


