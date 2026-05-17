const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');

exports.getFleetStats = async (req, res) => {
  try {
    const managerId = req.user.id;

    const [totalShipments, activeDrivers, vehiclesInTransit, pendingDeliveries] = await Promise.all([
      Shipment.countDocuments({ manager: managerId }),
      Driver.countDocuments({ manager: managerId, status: 'Available' }),
      Vehicle.countDocuments({ manager: managerId, status: 'In-Transit' }),
      Shipment.countDocuments({ manager: managerId, status: 'Pending' })
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        totalShipments,
        activeDrivers,
        vehiclesInTransit,
        pendingDeliveries
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformanceStats = async (req, res) => {
  try {
    const managerId = req.user.id;

    // Aggregation for on-time vs late
    const performance = await Shipment.aggregate([
      { 
        $match: { 
          manager: new mongoose.Types.ObjectId(managerId), 
          status: 'Delivered',
          deliveredAt: { $exists: true },
          estimatedDelivery: { $exists: true }
        } 
      },
      {
        $group: {
          _id: null,
          onTime: {
            $sum: {
              $cond: [
                { $lte: ["$deliveredAt", "$estimatedDelivery"] },
                1,
                0
              ]
            }
          },
          late: {
            $sum: {
              $cond: [
                { $gt: ["$deliveredAt", "$estimatedDelivery"] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Lead indicator: Vehicles in Transit
    // Lag indicator: Pending Deliveries
    const [vehiclesInTransit, pendingDeliveries] = await Promise.all([
      Vehicle.countDocuments({ manager: managerId, status: 'In-Transit' }),
      Shipment.countDocuments({ manager: managerId, status: 'Pending' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        performance: performance[0] || { onTime: 0, late: 0 },
        leadIndicators: { vehiclesInTransit },
        lagIndicators: { pendingDeliveries }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper for Distance calculation (Haversine Formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 50; // Fallback to 50km
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getCapacityForecast = async (req, res) => {
  try {
    const managerId = req.user.id;
    const now = new Date();

    // 1. Get all In-Transit shipments
    const shipments = await Shipment.find({ manager: managerId, status: 'In-Transit' });

    // 2. Calculate predicted availability list
    const availabilityList = shipments.map(s => {
      // Calculate ETA based on distance and 50km/h average speed
      const distance = getDistance(
        s.originCoords?.lat, s.originCoords?.lng,
        s.destinationCoords?.lat, s.destinationCoords?.lng
      );
      // Assume 50km/h average speed
      const hoursLeft = distance / 50;
      const eta = new Date(now.getTime() + hoursLeft * 60 * 60 * 1000);

      return {
        trackingNumber: s.trackingNumber,
        vehicleId: s.assignedVehicle,
        driverId: s.assignedDriver,
        eta,
        hoursUntilAvailable: Math.round(hoursLeft * 10) / 10
      };
    });

    // 3. Predicted Capacity (4-hour intervals for the next 24 hours)
    const intervals = [];
    for (let i = 0; i < 6; i++) {
      const intervalStart = new Date(now.getTime() + i * 4 * 60 * 60 * 1000);
      const intervalEnd = new Date(now.getTime() + (i + 1) * 4 * 60 * 60 * 1000);
      
      // Count resources that become free in this interval
      const freeResources = availabilityList.filter(a => a.eta >= intervalStart && a.eta < intervalEnd).length;
      
      intervals.push({
        time: `${i * 4}h`,
        label: intervalStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        available: freeResources
      });
    }

    res.status(200).json({
      success: true,
      data: {
        availabilityList,
        predictedCapacity: intervals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
