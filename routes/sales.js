const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createHarvestSale, getSales, getSalesById, getSalesByUserId, updateSaleStatus, cancelSale, rescheduleSale } = require('../controllers/salesController');

// 📝 Add Sale
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/harvest/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('proof_photo'), createHarvestSale);
router.get('/', getSales);
router.get('/:id', getSalesById);
router.get('/user/:userId', getSalesByUserId);
router.put("/:id/status", updateSaleStatus);
router.put("/cancel/:id", cancelSale);
router.put("/reschedule/:id", rescheduleSale);

module.exports = router;
