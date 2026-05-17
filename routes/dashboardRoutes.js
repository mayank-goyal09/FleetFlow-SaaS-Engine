const express = require('express');
const router = express.Router();
const { getSummary, getPredictedCapacity, getFleetPerformance, getFleetUtilization } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/shipments/summary', protect, getSummary);
router.get('/analytics/predicted-capacity', protect, getPredictedCapacity);
router.get('/analytics/fleet-performance', protect, getFleetPerformance);
router.get('/analytics/fleet-utilization', protect, getFleetUtilization);

module.exports = router;
