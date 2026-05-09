const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In-Transit', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  // RELATIONSHIPS
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The person who created it
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
