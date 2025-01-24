const db = require('../config/db');

exports.getAllTutorials = async (req, res) => {
    try {
        const [tutorials] = await db.query('SELECT * FROM video ORDER BY created_at DESC');
        res.json([tutorials]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch videos.', error });
    }
};

exports.createTutorial = async (req, res) => {
    const { title, description, youtube_link } = req.body;
    try {
        await db.query('INSERT INTO video (title, description, youtube_link) VALUES (?, ?, ?)', [title, description, youtube_link]);
        res.status(201).json({ message: 'Video created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create video', error });
    }
};

exports.updateTutorial = async (req, res) => {
    const { id } = req.params;
    const { title, description, youtube_link } = req.body;
    try {
        await db.query('UPDATE video SET title = ?, description = ?, youtube_link = ? WHERE id = ?', [title, description, youtube_link, id]);
        res.status(200).json({ message: 'video updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update video', error });
    }
};

exports.deleteTutorial = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM video WHERE id = ?', [id]);
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete video', error });
    }
};
