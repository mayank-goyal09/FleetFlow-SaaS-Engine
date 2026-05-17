const express = require('express');
const router = express.Router();
const { addVehicle, getVehicles, updateLocation, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware'); // Import the bouncer

// Protected route: Get all vehicles for the manager
router.get('/', protect, getVehicles);

// Protected routes
router.post('/add', protect, addVehicle);
router.patch('/:id/location', protect, updateLocation);
router.delete('/:id', protect, deleteVehicle);


module.exports = router;

