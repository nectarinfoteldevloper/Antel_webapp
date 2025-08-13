const db = require('./config/database');

db.run(`DELETE FROM users WHERE mobileNumber BETWEEN '9876543210' AND '9876543219'`, function(err) {
    if (err) {
        console.error('Error deleting users:', err);
    } else {
        console.log(`✅ Deleted ${this.changes} dummy users`);
    }
    db.close();
});
