const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define API endpoints for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;