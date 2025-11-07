const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

router.post('/add', streamController.addStream);
router.get('/', streamController.getStreams);
router.delete('/:id', streamController.deleteStream);

module.exports = router;
