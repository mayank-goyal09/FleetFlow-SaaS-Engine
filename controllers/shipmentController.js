const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const sendEmail = require('../utils/sendEmail');



// Create a Shipment
exports.createShipment = async (req, res) => {
  try {
    const shipment = await Shipment.create({ ...req.body, manager: req.user });

    // NEW: Get the driver's info to send them an email
    const driver = await Driver.findById(req.body.assignedDriver);
    
    if (driver && driver.email) {
       await sendEmail({
        email: driver.email,
        subject: 'New Shipment Assigned!',
        message: `Hello ${driver.name}, you have a new shipment from ${shipment.origin} to ${shipment.destination}. Tracking: ${shipment.trackingNumber}`
      });
    }

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Get Full Shipment Details (The "Populate" Magic)
exports.getShipmentDetails = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('assignedVehicle', 'model') // Only show truck model
      .populate('assignedDriver', 'name')   // Only show driver name
      .populate('manager', 'name email');   // Only show name and email of manager

    if (!shipment) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Shipments (With Filtering, Pagination, and Sorting)
exports.getAllShipments = async (req, res) => {
  try {
    // 1. Filtering (e.g., ?status=In-Transit)
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 2. Pagination Logic
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(queryObj)
      .populate('assignedVehicle assignedDriver')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'); // Newest first

    const total = await Shipment.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: shipments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: shipments
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Update Shipment Status (The "Logical" Side Effect)
exports.updateShipmentStatus = async (req, res) => {
  const { status } = req.body; // e.g., "Delivered"
  const { id } = req.params;   // Shipment ID

  try {
    const shipment = await Shipment.findById(id);
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    // Update the shipment status
    shipment.status = status;
    await shipment.save();

    // LOGIC SIDE EFFECT: If delivered, free up the vehicle!
    if (status === 'Delivered') {
      await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, { 
        status: 'Available' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Shipment marked as ${status}. Vehicle is now Available.`,
      data: shipment 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

