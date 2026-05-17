const express = require('express');
const router = express.Router();
const { getFleetStats, getPerformanceStats, getCapacityForecast } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// Stats are for managers only
router.get('/fleet', protect, getFleetStats);
router.get('/performance', protect, getPerformanceStats);
router.get('/forecast', protect, getCapacityForecast);
router.get('/ping', (req, res) => res.send('pong'));

module.exports = router;
