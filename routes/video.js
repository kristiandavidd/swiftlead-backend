const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/', videoController.getAllTutorials);
router.post('/', videoController.createTutorial);
router.put('/:id', videoController.updateTutorial);
router.delete('/:id', videoController.deleteTutorial);

module.exports = router;
