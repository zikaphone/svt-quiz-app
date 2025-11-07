const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');

router.post('/add', levelController.addLevel);
router.get('/', levelController.getLevels);
router.delete('/:id', levelController.deleteLevel);

module.exports = router;
