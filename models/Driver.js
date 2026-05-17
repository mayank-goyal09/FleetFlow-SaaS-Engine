const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'On-Trip', 'Off-Duty'],
    default: 'Available'
  },
  assignedVehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', // This links to the Vehicle model
    default: null 
  },
  nextAvailableAt: { type: Date },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
