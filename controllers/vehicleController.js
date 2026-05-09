const Vehicle = require('../models/Vehicle');

// Create a new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng } },
      { new: true }
    );
    res.status(200).json({ success: true, location: vehicle.currentLocation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Soft Delete (Retire Vehicle)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    // Safety Check: Don't allow deletion of active trucks!
    if (vehicle.status === 'In-Transit') {
      return res.status(400).json({ 
        message: "Cannot remove a vehicle that is currently In-Transit!" 
      });
    }

    // Soft Delete
    vehicle.status = 'Retired'; 
    await vehicle.save();

    res.status(200).json({ success: true, message: "Vehicle retired successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


