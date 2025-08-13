const db = require('./config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const dummyUsersData = [
    { name: "Rahul", mobileNumber: "1234567890", password: "password123", dataBalance: 5.2, packValidity: '24 Sep, 2025', callStatus: 'Unlimited' },
    { name: "Anjali", mobileNumber: "9876543210", password: "password123", dataBalance: 1.5, packValidity: '10 Nov, 2025', callStatus: '100 mins left' },
    { name: "Sanjay", mobileNumber: "9988776655", password: "password123", dataBalance: 2.8, packValidity: '01 Oct, 2025', callStatus: 'Unlimited' },
    { name: "Priya", mobileNumber: "9000111222", password: "password123", dataBalance: 0.5, packValidity: '05 Sep, 2025', callStatus: '50 mins left' },
    { name: "Vikram", mobileNumber: "8899889988", password: "password123", dataBalance: 4.1, packValidity: '15 Dec, 2025', callStatus: 'Unlimited' },
    { name: "Neha", mobileNumber: "7766554433", password: "password123", dataBalance: 3.3, packValidity: '20 Nov, 2025', callStatus: 'Unlimited' },
    { name: "Arjun", mobileNumber: "9911223344", password: "password123", dataBalance: 6.7, packValidity: '02 Oct, 2025', callStatus: 'Unlimited' },
    { name: "Meera", mobileNumber: "9567890123", password: "password123", dataBalance: 1.0, packValidity: '09 Sep, 2025', callStatus: '120 mins left' },
    { name: "Kapil", mobileNumber: "9123456789", password: "password123", dataBalance: 8.9, packValidity: '30 Jan, 2026', callStatus: 'Unlimited' },
    { name: "Riya", mobileNumber: "9870123456", password: "password123", dataBalance: 2.1, packValidity: '18 Oct, 2025', callStatus: 'Unlimited' },
];

const dummyRecharges = [
    { date: '24 Sep, 2025', amount: 599, plan: '1.5 GB/day, 84 days', status: 'Success' },
    { date: '25 Jun, 2025', amount: 479, plan: '1.5 GB/day, 56 days', status: 'Success' },
    { date: '26 Apr, 2025', amount: 399, plan: '1.5 GB/day, 28 days', status: 'Success' },
    { date: '20 Feb, 2025', amount: 239, plan: '1 GB/day, 24 days', status: 'Success' }
];

const dummyDevices = [
    { name: 'iPhone 14', lastActive: 'Today, 11:30 AM', location: 'Raipur, Chhattisgarh' },
    { name: 'MacBook Air', lastActive: 'Yesterday, 09:00 PM', location: 'Home Network' }
];

const dummyRewards = [
    { title: 'Amazon Prime Voucher', description: 'Get 1 month free Amazon Prime subscription on your next recharge of ₹599 or above.' },
    { title: '₹50 Cashback', description: '₹50 cashback on your next utility bill payment.' }
];

const dummyTickets = [
    { ticketId: '20250812-001', issue: 'Slow internet speed in my area', submittedOn: '12 Aug, 2025', status: 'Open' },
    { ticketId: '20250720-005', issue: 'Recharge amount not credited', submittedOn: '20 Jul, 2025', status: 'Closed' }
];

const runDbQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const setupDatabase = async () => {
    try {
        console.log('Setting up database...');
        
        await runDbQuery(`DROP TABLE IF EXISTS users`);
        await runDbQuery(`DROP TABLE IF EXISTS recharge_history`);
        await runDbQuery(`DROP TABLE IF EXISTS devices`);
        await runDbQuery(`DROP TABLE IF EXISTS rewards`);
        await runDbQuery(`DROP TABLE IF EXISTS support_tickets`);

        await runDbQuery(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mobileNumber TEXT UNIQUE,
                password TEXT,
                name TEXT,
                dataBalance REAL,
                packValidity TEXT,
                callStatus TEXT
            );
        `);
        console.log('users table created.');
        
        await runDbQuery(`
            CREATE TABLE recharge_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                amount INTEGER,
                plan TEXT,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        console.log('recharge_history table created.');

        await runDbQuery(`
            CREATE TABLE devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                lastActive TEXT,
                location TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        console.log('devices table created.');
        
        await runDbQuery(`
            CREATE TABLE rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                description TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        console.log('rewards table created.');
        
        await runDbQuery(`
            CREATE TABLE support_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                ticketId TEXT UNIQUE,
                issue TEXT,
                submittedOn TEXT,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        console.log('support_tickets table created.');

        // Insert dummy data for all 10 users
        for (const user of dummyUsersData) {
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            const userId = await runDbQuery(`INSERT INTO users (mobileNumber, password, name, dataBalance, packValidity, callStatus) VALUES (?, ?, ?, ?, ?, ?)`,
                [user.mobileNumber, hashedPassword, user.name, user.dataBalance, user.packValidity, user.callStatus]
            );

            console.log(`User ${user.name} inserted with ID: ${userId}`);

            // Insert dummy recharge history
            for (const r of dummyRecharges) {
                await runDbQuery(`INSERT INTO recharge_history (user_id, date, amount, plan, status) VALUES (?, ?, ?, ?, ?)`,
                    [userId, r.date, r.amount, r.plan, r.status]
                );
            }

            // Insert dummy devices
            for (const d of dummyDevices) {
                await runDbQuery(`INSERT INTO devices (user_id, name, lastActive, location) VALUES (?, ?, ?, ?)`,
                    [userId, `${user.name}'s ${d.name}`, d.lastActive, d.location]
                );
            }
            
            // Insert dummy rewards
            for (const r of dummyRewards) {
                await runDbQuery(`INSERT INTO rewards (user_id, title, description) VALUES (?, ?, ?)`,
                    [userId, r.title, r.description]
                );
            }
            
            // Insert dummy support tickets
            for (const t of dummyTickets) {
                const uniqueTicketId = `${user.mobileNumber.slice(-4)}-${t.submittedOn.replace(/ /g, '')}-${t.ticketId.slice(-3)}`;
                await runDbQuery(`INSERT INTO support_tickets (user_id, ticketId, issue, submittedOn, status) VALUES (?, ?, ?, ?, ?)`,
                    [userId, uniqueTicketId, t.issue, t.submittedOn, t.status]
                );
            }
        }
        
        console.log('Database setup and data insertion complete.');
        db.close((err) => {
            if (err) console.error(err.message);
            console.log('Database connection closed.');
        });

    } catch (error) {
        console.error('Error during database setup:', error.message);
        db.close();
    }
};

setupDatabase();