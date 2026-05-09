const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.assignDriverToVehicle = async (req, res) => {
  const { driverId, vehicleId } = req.body;

  try {
    // 1. Update the Driver
    await Driver.findByIdAndUpdate(driverId, { assignedVehicle: vehicleId });

    // 2. Update the Vehicle Status
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId, 
      { status: 'In-Transit' }, 
      { new: true } // Returns the updated document
    );

    res.status(200).json({ 
      success: true, 
      message: "Assignment successful", 
      data: updatedVehicle 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
