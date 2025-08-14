
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate'); // Import the secure middleware

console.log('authenticate:', typeof authenticate);
console.log('getAllDashboardData:', typeof userController.getAllDashboardData);
    

// This is the new, secure endpoint that serves all dashboard data.
// It is protected by the `authenticate` middleware.
router.get('/all-dashboard-data', authenticate, userController.getAllDashboardData);

module.exports = router;