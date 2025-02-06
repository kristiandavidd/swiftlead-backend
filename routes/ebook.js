const express = require('express');
const multer = require('multer');
const ebookController = require('../controllers/ebookController');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'ebookFile') {
            cb(null, './uploads/ebooks'); 
        } else if (file.fieldname === 'thumbnail') {
            cb(null, './uploads/thumbnails'); 
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

router.get('/', ebookController.getEbooks);
router.post('/', upload.fields([{ name: 'ebookFile' }, { name: 'thumbnail' }]), ebookController.addEbook);
router.put('/:id', upload.fields([{ name: 'ebookFile' }, { name: 'thumbnail' }]), ebookController.updateEbook);
router.delete('/:id', ebookController.deleteEbook);

module.exports = router;
