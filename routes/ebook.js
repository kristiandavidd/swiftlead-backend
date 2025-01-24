const express = require('express');
const multer = require('multer');
const ebookController = require('../controllers/ebookController');
const router = express.Router();

// Konfigurasi Multer untuk file eBook
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'ebookFile') {
            cb(null, './uploads/ebooks'); // Folder untuk eBook
        } else if (file.fieldname === 'thumbnail') {
            cb(null, './uploads/thumbnails'); // Folder untuk thumbnail
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes
router.get('/', ebookController.getEbooks);
router.post('/', upload.fields([{ name: 'ebookFile' }, { name: 'thumbnail' }]), ebookController.addEbook);
router.put('/:id', upload.fields([{ name: 'ebookFile' }, { name: 'thumbnail' }]), ebookController.updateEbook);
router.delete('/:id', ebookController.deleteEbook);

module.exports = router;
