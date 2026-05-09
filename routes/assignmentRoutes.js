const express = require('express');
const router = express.Router();
const { assignDriverToVehicle } = require('../controllers/assignmentController');

// Route for assigning a driver to a vehicle
router.post('/assign', assignDriverToVehicle);

module.exports = router;
