const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/database'); // Database connection is still here
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use our modular route files
// All /api/auth/* requests will be handled by authRoutes
app.use('/api/auth', authRoutes);
// All /api/user/* requests will be handled by userRoutes
app.use('/api/user', userRoutes);

// Default route for the root URL, serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`AnTel Backend Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});