const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define API endpoints for all user-related data
router.get('/dashboard/:mobileNumber', userController.getDashboardData);
router.get('/recharge-history/:mobileNumber', userController.getRechargeHistoryData);
router.get('/devices/:mobileNumber', userController.getDevicesData);
router.get('/rewards/:mobileNumber', userController.getRewardsData);
router.get('/support-tickets/:mobileNumber', userController.getSupportTicketsData);

module.exports = router;