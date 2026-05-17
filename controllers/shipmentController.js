const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const sendEmail = require('../utils/sendEmail');

// Create a Shipment
exports.createShipment = async (req, res) => {
  try {
    // 1. Verify Driver and Vehicle Availability BEFORE creating
    let driver = null;
    let vehicle = null;

    if (req.body.assignedDriver) {
      driver = await Driver.findById(req.body.assignedDriver);
      if (!driver || driver.status !== 'Available') {
        return res.status(400).json({ success: false, error: 'Selected driver is not available.' });
      }
    }

    if (req.body.assignedVehicle) {
      vehicle = await Vehicle.findById(req.body.assignedVehicle);
      if (!vehicle || vehicle.status !== 'Available') {
        return res.status(400).json({ success: false, error: 'Selected vehicle is not available.' });
      }
    }

    // 2. Create the Shipment
    const estimatedDelivery = req.body.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const shipment = await Shipment.create({ 
      ...req.body, 
      manager: req.user.id,
      estimatedDelivery
    });

    // 3. Send Notifications (Non-blocking background tasks)
    if (driver && driver.email) {
      sendEmail({
        email: driver.email,
        subject: 'New Shipment Assigned! 🚛',
        message: `Hello ${driver.name}, you have a new shipment from ${shipment.origin} to ${shipment.destination}. Tracking: ${shipment.trackingNumber}`
      }).catch(err => console.error('Driver Assignment Email Error:', err));
    }

    if (shipment.customerEmail) {
      sendEmail({
        email: shipment.customerEmail,
        subject: 'Order Confirmed! 📦',
        message: `Hello ${shipment.customerName}, your shipment ${shipment.trackingNumber} has been created and is now being prepared for dispatch to ${shipment.destination}.`
      }).catch(err => console.error('Customer Creation Email Error:', err));
    }

    // 4. Update Statuses to "Assigned" (Not yet In-Transit)
    if (vehicle) {
      vehicle.status = 'Assigned';
      await vehicle.save();
    }
    
    if (driver) {
      driver.status = 'Assigned';
      await driver.save();
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
      .populate('assignedVehicle', 'licensePlate make model')
      .populate('assignedDriver', 'name email phone')
      .populate('manager', 'name email');

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
    const queryObj = { ...req.query, manager: req.user.id };
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

    // 3. Consolidation Logic
    // Group all shipments by "Sector" (simplified as first part of destination)
    const allShipmentsForManager = await Shipment.find({ manager: req.user.id, status: 'Pending' });
    const sectors = {};
    allShipmentsForManager.forEach(s => {
      const sector = s.destination.split(',')[0].trim().toUpperCase();
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push(s.trackingNumber);
    });

    const consolidationFlags = Object.keys(sectors)
      .filter(sector => sectors[sector].length >= 3)
      .map(sector => ({
        sector,
        shipments: sectors[sector],
        count: sectors[sector].length
      }));

    res.status(200).json({
      success: true,
      count: shipments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      consolidationFlags,
      data: shipments
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Update Shipment Status (The "Logical" Side Effect)
exports.updateShipmentStatus = async (req, res) => {
  const { status } = req.body; 
  const { id } = req.params;

  try {
    const shipment = await Shipment.findById(id);
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    // Update the shipment status
    shipment.status = status;
    if (status === 'Delivered') {
      shipment.deliveredAt = Date.now();
    }
    await shipment.save();

    // Fetch driver for notification
    const populatedShipment = await Shipment.findById(id).populate('assignedDriver');
    const driver = populatedShipment.assignedDriver;

    // LOGIC SIDE EFFECT: 
    // 1. If shipment is now moving (In-Transit), update resources
    if (status === 'In-Transit') {
      if (shipment.assignedVehicle) {
        // Calculate a dummy ETA (Current + 4 hours for demo)
        const eta = new Date(Date.now() + 4 * 60 * 60 * 1000);
        await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, { 
          status: 'In-Transit',
          nextAvailableAt: eta
        });
      }
      if (shipment.assignedDriver) {
        const eta = new Date(Date.now() + 4 * 60 * 60 * 1000);
        await Driver.findByIdAndUpdate(shipment.assignedDriver, { 
          status: 'On-Trip',
          nextAvailableAt: eta
        });
      }

      // BACKGROUND EMAIL TRIGGER (Non-blocking)
      if (driver && driver.email) {
        sendEmail({
          email: driver.email,
          subject: 'Trip Started! 🚛',
          message: `Hello ${driver.name}, your trip for shipment ${shipment.trackingNumber} from ${shipment.origin} has officially started. Drive safe!`
        }).catch(err => console.error('Driver Email Error:', err));
      }

      if (shipment.customerEmail) {
        sendEmail({
          email: shipment.customerEmail,
          subject: 'Your Order is on the way! 🚛',
          message: `Hello ${shipment.customerName}, your shipment ${shipment.trackingNumber} from ${shipment.origin} has been dispatched and is now In-Transit.`
        }).catch(err => console.error('Customer Email Error:', err));
      }
    }

    // 2. If delivered or cancelled, free up the resources
    if (status === 'Delivered' || status === 'Cancelled') {
      if (shipment.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(shipment.assignedVehicle, { 
          status: 'Available',
          nextAvailableAt: null
        });
      }
      if (shipment.assignedDriver) {
        await Driver.findByIdAndUpdate(shipment.assignedDriver, { 
          status: 'Available',
          nextAvailableAt: null
        });
      }

      // BACKGROUND EMAIL TRIGGER (Non-blocking)
      if (status === 'Delivered') {
        if (driver && driver.email) {
          sendEmail({
            email: driver.email,
            subject: 'Shipment Delivered! ✅',
            message: `Great job ${driver.name}! Shipment ${shipment.trackingNumber} has been marked as Delivered.`
          }).catch(err => console.error('Driver Completion Email Error:', err));
        }

        if (shipment.customerEmail) {
          sendEmail({
            email: shipment.customerEmail,
            subject: 'Your Order was Delivered! ✅',
            message: `Hello ${shipment.customerName}, your shipment ${shipment.trackingNumber} has been successfully delivered to ${shipment.destination}. Thank you for choosing FleetFlow!`
          }).catch(err => console.error('Customer Completion Email Error:', err));
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Shipment marked as ${status}. Notifications triggered.`,
      data: shipment 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

