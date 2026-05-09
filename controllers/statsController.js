const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');

exports.getFleetStats = async (req, res) => {
  try {
    const stats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status', // Group by the 'status' field
          count: { $sum: 1 } // Count how many in each group
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
