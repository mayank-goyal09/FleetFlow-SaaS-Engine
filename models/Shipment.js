const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, unique: true }, // Removed required: true because pre-save hook handles it
  origin: { type: String, required: true },
  originCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  destination: { type: String, required: true },
  destinationCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In-Transit', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  serviceType: {
    type: String,
    enum: ['Standard', 'Express'],
    default: 'Standard'
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  // RELATIONSHIPS
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The person who created it
}, { timestamps: true });

const geocode = require('../utils/geocode');

// Auto-generate tracking number and coordinates if missing
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'SHIP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // Smart Geocoding: Auto-fetch coordinates using our API if they are missing
  if (!this.originCoords || !this.originCoords.lat) {
    const coords = await geocode(this.origin);
    if (coords) this.originCoords = coords;
  }
  
  if (!this.destinationCoords || !this.destinationCoords.lat) {
    const coords = await geocode(this.destination);
    if (coords) this.destinationCoords = coords;
  }

  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
