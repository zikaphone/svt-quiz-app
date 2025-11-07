const express = require('express');
const router = express.Router();
const {  userData, saveUser  } = require('../controllers/authController');

router.get('/user', userData);
router.post("/save-user", saveUser);
module.exports = router;
