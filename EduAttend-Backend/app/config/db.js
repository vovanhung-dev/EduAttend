const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'viaduct.proxy.rlwy.net',
    user: 'root',
    password: 'FlGyqbZzoEJeTCNjtkpMzILgkvVezmVw',
    database: 'eduattend',
    port: 21865
});

module.exports = db;
