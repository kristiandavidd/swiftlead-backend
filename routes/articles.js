const express = require('express');
const router = express.Router();
const multer = require('multer');
const articleController = require('../controllers/articleController');

// Konfigurasi upload
const upload = multer({ dest: 'uploads/' });

// Rute artikel
router.get('/tags', articleController.getAllTags);
router.post('/', upload.single('cover'), articleController.createArticle);
router.put('/:id', upload.single('cover'), articleController.updateArticle);
router.delete('/comments/:id', articleController.deleteComment); // Delete a comment
router.delete('/:id', articleController.deleteArticle);
router.get('/', articleController.getAllArticles);
router.get('/published', articleController.getAllPublishedArticles);
router.get('/member', articleController.getAllMembershipArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id/status', articleController.updateArticleStatus);
router.get('/:id/recommendations', articleController.getRecommendedArticles); // Get recommendations
router.get('/:id/comments', articleController.getComments); // Get comments
router.post('/:id/comments', articleController.addComment); // Add a comment

module.exports = router;
