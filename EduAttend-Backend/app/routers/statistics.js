const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// Định tuyến cho API thống kê
router.get('/all', statisticsController.getAllStatistics);

module.exports = router;
