const Driver = require('../models/Driver');

// Create a new driver
exports.addDriver = async (req, res) => {
  try {
    const driver = await Driver.create({ ...req.body, manager: req.user.id });
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        error: `A driver with this ${field} already exists.` 
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ manager: req.user.id }).populate('assignedVehicle');
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
