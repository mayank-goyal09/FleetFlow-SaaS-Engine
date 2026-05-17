const express = require('express');
const router = express.Router();
const { addDriver, getDrivers } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all driver routes

router.route('/')
    .post(addDriver)
    .get(getDrivers);

module.exports = router;
