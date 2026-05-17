const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');

// Unified API response formatter as per repair skill
const sendResponse = (res, data) => {
  res.status(200).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, code, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  });
};

exports.getSummary = async (req, res) => {
  try {
    const managerId = req.user.id;
    // For demo purposes, returning hardcoded deltas but real counts
    const [totalShipments, activeDrivers, vehiclesInTransit, pendingDeliveries] = await Promise.all([
      Shipment.countDocuments({ manager: managerId }),
      Driver.countDocuments({ manager: managerId, status: 'Available' }),
      Vehicle.countDocuments({ manager: managerId, status: 'In-Transit' }),
      Shipment.countDocuments({ manager: managerId, status: 'Pending' })
    ]);

    sendResponse(res, {
      totalShipments,
      totalShipmentsDelta: 12, // mock delta
      activeDrivers,
      activeDriversDelta: 2,
      vehiclesInTransit,
      vehiclesInTransitDelta: -1,
      pendingDeliveries,
      pendingDeliveriesDelta: 18
    });
  } catch (err) {
    sendError(res, 'DB_ERROR', err.message);
  }
};

exports.getPredictedCapacity = async (req, res) => {
  try {
    const managerId = req.user.id;
    const shipments = await Shipment.find({ manager: managerId, status: 'In-Transit' });
    
    // Simulate 4-hour intervals starting at hour 0, 4, 8, 12, 16, 20
    const capacityMap = [
      { hour: 0, capacity: 0 },
      { hour: 4, capacity: 0 },
      { hour: 8, capacity: 0 },
      { hour: 12, capacity: 0 },
      { hour: 16, capacity: 0 },
      { hour: 20, capacity: 0 }
    ];

    // Distribute vehicles based on a rough 50km/h estimate
    shipments.forEach(s => {
      // Mock logic: randomly distribute the available capacity over the hours for demonstration,
      // in reality this uses distance / 50km/h
      const hourIndex = Math.floor(Math.random() * 6);
      capacityMap[hourIndex].capacity += 1;
    });

    sendResponse(res, capacityMap);
  } catch (err) {
    sendError(res, 'DB_ERROR', err.message);
  }
};

exports.getFleetPerformance = async (req, res) => {
  try {
    const managerId = req.user.id;
    const delivered = await Shipment.find({ manager: managerId, status: 'Delivered' });

    let onTime = 0;
    let late = 0;

    delivered.forEach(d => {
      if (d.deliveredAt && d.estimatedDelivery && d.deliveredAt > d.estimatedDelivery) {
        late++;
      } else {
        onTime++;
      }
    });

    // Mocking byDay stats for the chart
    const byDay = [
      { day: "Mon", onTime: Math.floor(onTime * 0.2), late: Math.floor(late * 0.2) },
      { day: "Tue", onTime: Math.floor(onTime * 0.3), late: Math.floor(late * 0.1) },
      { day: "Wed", onTime: Math.floor(onTime * 0.5), late: Math.floor(late * 0.7) }
    ];

    sendResponse(res, {
      onTime,
      late,
      byDay
    });
  } catch (err) {
    sendError(res, 'DB_ERROR', err.message);
  }
};

exports.getFleetUtilization = async (req, res) => {
  try {
    const managerId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    
    const util = [];
    for(let i=1; i<=days; i++) {
      util.push({
        day: i,
        date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
        shipmentVolume: Math.floor(Math.random() * 10) + 1 // Mock volume for now
      });
    }

    sendResponse(res, util);
  } catch (err) {
    sendError(res, 'DB_ERROR', err.message);
  }
};
