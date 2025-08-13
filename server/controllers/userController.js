const User = require('../models/User'); // Import the updated User model

// Controller to get a user's dashboard data
const getDashboardData = async (req, res) => {
    const { mobileNumber } = req.params;

    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        // Exclude the password from the response for security
        const { password, ...userWithoutPassword } = user;
        
        res.status(200).json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Dashboard data fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// New controller to get a user's recharge history
const getRechargeHistoryData = async (req, res) => {
    const { mobileNumber } = req.params;
    
    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        const recharges = await User.getRechargeHistory(user.id);
        res.status(200).json({ success: true, recharges });

    } catch (error) {
        console.error('Recharge history fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// New controller to get a user's connected devices
const getDevicesData = async (req, res) => {
    const { mobileNumber } = req.params;
    
    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        const devices = await User.getDevices(user.id);
        res.status(200).json({ success: true, devices });

    } catch (error) {
        console.error('Devices data fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// New controller to get a user's rewards
const getRewardsData = async (req, res) => {
    const { mobileNumber } = req.params;
    
    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        const rewards = await User.getRewards(user.id);
        res.status(200).json({ success: true, rewards });

    } catch (error) {
        console.error('Rewards data fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// New controller to get a user's support tickets
const getSupportTicketsData = async (req, res) => {
    const { mobileNumber } = req.params;
    
    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        const tickets = await User.getSupportTickets(user.id);
        res.status(200).json({ success: true, tickets });

    } catch (error) {
        console.error('Support tickets fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getDashboardData,
    getRechargeHistoryData,
    getDevicesData,
    getRewardsData,
    getSupportTicketsData
};