const express = require('express');
const router = express.Router();
const { getFleetStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// Stats are for managers only
router.get('/fleet', protect, getFleetStats);

module.exports = router;
