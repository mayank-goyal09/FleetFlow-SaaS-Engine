const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },

  assignedVehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', // This links to the Vehicle model
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
