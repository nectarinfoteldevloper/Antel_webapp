const jwt = require('jsonwebtoken'); // You'll need a JWT library like 'jsonwebtoken'
const JWT_SECRET = 'your-secret-key'; // This should be a strong secret from your env variables

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authentication token missing.' });
    }

    const token = authHeader.split(' ')[1]; // Expects format "Bearer <token>"
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach the user ID to the request object
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = authenticate;
