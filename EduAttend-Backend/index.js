const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2'); 
const app = express();
const _CONST = require('./app/config/constant')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

require('./app/models/createTables');

// Thay đổi kết nối cơ sở dữ liệu
const db = mysql.createConnection({
    host: 'database-1.cpqwqaawsjr7.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Vovanhung77h',
    database: 'eduattend',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
        console.log('Connected to MySQL.');
    }
});

const authRoute = require('./app/routers/auth');
const userRoute = require('./app/routers/user');
const examRoute = require('./app/routers/exam');
const statisticsRoute = require('./app/routers/statistics');

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/exam', examRoute);
app.use('/api/statistics', statisticsRoute);

const PORT = process.env.PORT || _CONST.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
