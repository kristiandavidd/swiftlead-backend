const express = require('express');
const router = express.Router();
const multer = require('multer');
const articleController = require('../controllers/articleController');

// Konfigurasi upload
const upload = multer({ dest: 'uploads/' });

// Rute artikel
router.post('/', upload.single('cover'), articleController.createArticle);
router.put('/:id', upload.single('cover'), articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);
router.get('/', articleController.getAllArticles);
router.get('/published', articleController.getAllPublishedArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id/status', articleController.updateArticleStatus);


module.exports = router;
