const Driver = require('../models/Driver');

// Create a new driver
exports.addDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedVehicle');
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
