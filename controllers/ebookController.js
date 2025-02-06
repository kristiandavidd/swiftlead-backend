const fs = require('fs');
const db = require('../config/db');

exports.getEbooks = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM ebooks ORDER BY created_at DESC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching ebooks:', error);
        res.status(500).json({ message: 'Failed to fetch ebooks.' });
    }
};

exports.addEbook = async (req, res) => {
    const { title } = req.body;
    const { ebookFile, thumbnail } = req.files;

    try {
        const ebookPath = `/uploads/ebooks/${ebookFile[0].filename}`;
        const thumbnailPath = `/uploads/thumbnails/${thumbnail[0].filename}`;

        await db.query('INSERT INTO ebooks (title, file_path, thumbnail_path) VALUES (?, ?, ?)', [
            title,
            ebookPath,
            thumbnailPath,
        ]);

        res.status(201).json({ message: 'E-book berhasil ditambahkan.' });
    } catch (error) {
        console.error('Error adding ebook:', error);
        res.status(500).json({ message: 'Gagal dalam menambahkan E-Book.' });
    }
};

exports.updateEbook = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const { ebookFile, thumbnail } = req.files || {};

    try {
        const [ebook] = await db.query('SELECT * FROM ebooks WHERE id = ?', [id]);
        if (!ebook.length) return res.status(404).json({ message: 'E-Book tidak ditemukan.' });

        const updateFields = {
            title,
            file_path: ebook[0].file_path,
            thumbnail_path: ebook[0].thumbnail_path,
        };

        if (ebookFile && ebookFile[0]) {
            const ebookPath = `/uploads/ebooks/${ebookFile[0].filename}`;
            updateFields.file_path = ebookPath;

            fs.unlinkSync(`.${ebook[0].file_path}`); 
        }

        if (thumbnail && thumbnail[0]) {
            const thumbnailPath = `/uploads/thumbnails/${thumbnail[0].filename}`;
            updateFields.thumbnail_path = thumbnailPath;

            fs.unlinkSync(`.${ebook[0].thumbnail_path}`); 
        }

        await db.query(
            'UPDATE ebooks SET title = ?, file_path = ?, thumbnail_path = ? WHERE id = ?',
            [updateFields.title, updateFields.file_path, updateFields.thumbnail_path, id]
        );

        res.json({ message: 'E-Book berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating ebook:', error);
        res.status(500).json({ message: 'Gagal dalam memperbarui E-Book.' });
    }
};

exports.deleteEbook = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
        const [ebook] = await db.query('SELECT * FROM ebooks WHERE id = ?', [id]);
        if (!ebook.length) return res.status(404).json({ message: 'E-Book tidak ditemukan.' });

        fs.unlinkSync(`.${ebook[0].file_path}`);
        fs.unlinkSync(`.${ebook[0].thumbnail_path}`);

        await db.query('DELETE FROM ebooks WHERE id = ?', [id]);

        res.json({ message: 'Berhasil menghapus E-Book.' });
    } catch (error) {
        console.error('Error deleting ebook:', error);
        res.status(500).json({ message: 'Gagal dalam menghapus E-Book.' });
    }
};
