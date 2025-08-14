const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// IMPORTANT: Use a strong, secret key. It's best to store this in an environment variable.
const JWT_SECRET = 'your-secret-key'; 

// Controller for user signup
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
        res.status(201).json({ success: true, message: 'User created successfully.', userId: newUser.userId });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Controller for user login
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
        
        // Generate a JSON Web Token (JWT)
        const token = jwt.sign(
            { userId: user.id, mobileNumber: user.mobileNumber }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        
        // Exclude the password from the response
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: userWithoutPassword,
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