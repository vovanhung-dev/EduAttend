const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'database-1.cpqwqaawsjr7.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Vovanhung77h',
    database: 'eduattend',
    port: 3306
});

module.exports = db;
