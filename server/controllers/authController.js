const User = require('../models/User'); // Import the new User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Will use this later for proper tokens

// Controller for handling user sign up
const signup = async (req, res) => {
    const { name, mobileNumber, password } = req.body;

    if (!name || !mobileNumber || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findByMobileNumber(mobileNumber);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Mobile number already registered.' });
        }

        const newUser = await User.create(name, mobileNumber, password);
        res.status(201).json({ success: true, message: 'User registered successfully!', userId: newUser.userId });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
};

// Controller for handling user login
const login = async (req, res) => {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
        return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
    }

    try {
        const user = await User.findByMobileNumber(mobileNumber);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid mobile number or password.' });
        }

        // Generate a simple token for now, we'll refine this later
        const token = `bhai_ka_token_${user.mobileNumber}`;

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                mobileNumber: user.mobileNumber,
            },
            token: token
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    signup,
    login
};