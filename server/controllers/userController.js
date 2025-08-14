const User = require('../models/User'); // Import the updated User model

// Assuming you have this middleware
// const authenticate = require('../middleware/authenticate');

// Consolidated controller to get all dashboard data for the authenticated user
const getAllDashboardData = async (req, res) => {
    // The `authenticate` middleware ensures a user is logged in
    // and adds their userId to the request object.
    const userId = req.userId; // Get the user ID from the authenticated request

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    try {
        // Use Promise.all to fetch all data concurrently for better performance
        const [user, recharges, devices, rewards, supportTickets] = await Promise.all([
            User.findById(userId),
            User.getRechargeHistory(userId),
            User.getDevices(userId),
            User.getRewards(userId),
            User.getSupportTickets(userId)
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        // Exclude the password from the response for security
        const { password, ...userWithoutPassword } = user;
        
        // Respond with a single, consolidated JSON object
        res.status(200).json({
            success: true,
            user: userWithoutPassword,
            recharges: recharges,
            devices: devices,
            rewards: rewards,
            supportTickets: supportTickets
        });

    } catch (error) {
        console.error('Consolidated dashboard data fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getAllDashboardData
};