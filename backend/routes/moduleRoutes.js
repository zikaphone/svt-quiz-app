const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

router.post('/add', moduleController.addModule);
router.get('/', moduleController.getModules);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;
