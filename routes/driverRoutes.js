const express = require('express');
const router = express.Router();
const { addDriver, getDrivers } = require('../controllers/driverController');

router.route('/')
    .post(addDriver)
    .get(getDrivers);

module.exports = router;
