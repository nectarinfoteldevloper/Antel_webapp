const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// User model for all database interactions
class User {
    static async findByMobileNumber(mobileNumber) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE mobileNumber = ?`, [mobileNumber], (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }

    static async create(name, mobileNumber, password, dataBalance, packValidity, callStatus) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const balance = dataBalance !== undefined ? dataBalance : 0.0;
                const validity = packValidity || 'N/A';
                const callStatusText = callStatus || 'N/A';

                db.run(`INSERT INTO users (mobileNumber, password, name, dataBalance, packValidity, callStatus) VALUES (?, ?, ?, ?, ?, ?)`,
                    [mobileNumber, hashedPassword, name, balance, validity, callStatusText],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ userId: this.lastID });
                        }
                    }
                );
            });
        });
    }
    
    // --- New Methods to fetch data for dynamic pages ---
    
    static async getRechargeHistory(userId) {
        return new Promise((resolve, reject) => {
            // We use db.all() because we expect multiple records
            db.all(`SELECT * FROM recharge_history WHERE user_id = ? ORDER BY date DESC`, [userId], (err, recharges) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(recharges);
                }
            });
        });
    }

    static async getDevices(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM devices WHERE user_id = ?`, [userId], (err, devices) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(devices);
                }
            });
        });
    }

    static async getRewards(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM rewards WHERE user_id = ?`, [userId], (err, rewards) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rewards);
                }
            });
        });
    }
    
    static async getSupportTickets(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM support_tickets WHERE user_id = ? ORDER BY submittedOn DESC`, [userId], (err, tickets) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tickets);
                }
            });
        });
    }
}

module.exports = User;