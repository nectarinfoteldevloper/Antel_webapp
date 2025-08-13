const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path to your database file
// It will be created in the 'server' directory
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

// Open the database
// sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE means if it exists, open it, otherwise create it.
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the AnTel SQLite database.');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobileNumber TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            dataBalance REAL,
            packValidity TEXT,
            callStatus TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table checked/created.');
                // Optional: Insert a default user for testing if no users exist
                db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
                    if (err) {
                        console.error("Error checking user count:", err.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log("No users found, inserting a default user.");
                        // Hash a default password (we'll implement proper hashing later)
                        // For now, we'll store a plain text password for easy testing.
                        // IMPORTANT: In a real application, NEVER store plain text passwords!
                        const defaultPassword = 'password123'; // Replace with a hashed password in production
                        db.run(`INSERT INTO users (mobileNumber, password, name, dataBalance, packValidity, callStatus) VALUES (?, ?, ?, ?, ?, ?)`,
                            ['8412908773', defaultPassword, 'Paranjay', 4.50, '25 Sep, 2025', 'truly unlimited calls'],
                            function(err) {
                                if (err) {
                                    console.error('Error inserting default user:', err.message);
                                } else {
                                    console.log(`Default user inserted with ID: ${this.lastID}`);
                                }
                            }
                        );
                    }
                });
            }
        });
    }
});

module.exports = db;