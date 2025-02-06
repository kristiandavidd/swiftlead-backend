const express = require('express');
const router = express.Router();
const multer = require('multer');
const articleController = require('../controllers/articleController');

const upload = multer({ dest: 'uploads/' });

router.get('/tags', articleController.getAllTags);
router.post('/', upload.single('cover'), articleController.createArticle);
router.put('/:id', upload.single('cover'), articleController.updateArticle);
router.delete('/comments/:id', articleController.deleteComment); 
router.delete('/:id', articleController.deleteArticle);
router.get('/', articleController.getAllArticles);
router.get('/published', articleController.getAllPublishedArticles);
router.get('/member', articleController.getAllMembershipArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id/status', articleController.updateArticleStatus);
router.get('/:id/recommendations', articleController.getRecommendedArticles); 
router.get('/:id/comments', articleController.getComments); 
router.post('/:id/comments', articleController.addComment); 

module.exports = router;
