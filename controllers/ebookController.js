const fs = require('fs');
const db = require('../config/db'); // Sesuaikan dengan konfigurasi database Anda

// Get all eBooks
exports.getEbooks = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM ebooks ORDER BY created_at DESC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching ebooks:', error);
        res.status(500).json({ message: 'Failed to fetch ebooks.' });
    }
};

// Add eBook
exports.addEbook = async (req, res) => {
    const { title } = req.body;
    const { ebookFile, thumbnail } = req.files;

    try {
        // Simpan file dan thumbnail path ke database
        const ebookPath = `/uploads/ebooks/${ebookFile[0].filename}`;
        const thumbnailPath = `/uploads/thumbnails/${thumbnail[0].filename}`;

        await db.query('INSERT INTO ebooks (title, file_path, thumbnail_path) VALUES (?, ?, ?)', [
            title,
            ebookPath,
            thumbnailPath,
        ]);

        res.status(201).json({ message: 'Ebook added successfully.' });
    } catch (error) {
        console.error('Error adding ebook:', error);
        res.status(500).json({ message: 'Failed to add ebook.' });
    }
};

// Update eBook
exports.updateEbook = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const { ebookFile, thumbnail } = req.files || {};

    try {
        const [ebook] = await db.query('SELECT * FROM ebooks WHERE id = ?', [id]);
        if (!ebook.length) return res.status(404).json({ message: 'Ebook not found.' });

        const updateFields = {
            title,
            file_path: ebook[0].file_path,
            thumbnail_path: ebook[0].thumbnail_path,
        };

        // Jika ada file baru, simpan dan hapus file lama
        if (ebookFile && ebookFile[0]) {
            const ebookPath = `/uploads/ebooks/${ebookFile[0].filename}`;
            updateFields.file_path = ebookPath;

            fs.unlinkSync(`.${ebook[0].file_path}`); // Hapus file lama
        }

        if (thumbnail && thumbnail[0]) {
            const thumbnailPath = `/uploads/thumbnails/${thumbnail[0].filename}`;
            updateFields.thumbnail_path = thumbnailPath;

            fs.unlinkSync(`.${ebook[0].thumbnail_path}`); // Hapus thumbnail lama
        }

        await db.query(
            'UPDATE ebooks SET title = ?, file_path = ?, thumbnail_path = ? WHERE id = ?',
            [updateFields.title, updateFields.file_path, updateFields.thumbnail_path, id]
        );

        res.json({ message: 'Ebook updated successfully.' });
    } catch (error) {
        console.error('Error updating ebook:', error);
        res.status(500).json({ message: 'Failed to update ebook.' });
    }
};

// Delete eBook
exports.deleteEbook = async (req, res) => {
    const { id } = req.params;

    try {
        const [ebook] = await db.query('SELECT * FROM ebooks WHERE id = ?', [id]);
        if (!ebook.length) return res.status(404).json({ message: 'Ebook not found.' });

        // Hapus file dan thumbnail dari server
        fs.unlinkSync(`.${ebook[0].file_path}`);
        fs.unlinkSync(`.${ebook[0].thumbnail_path}`);

        // Hapus dari database
        await db.query('DELETE FROM ebooks WHERE id = ?', [id]);

        res.json({ message: 'Ebook deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ebook:', error);
        res.status(500).json({ message: 'Failed to delete ebook.' });
    }
};
