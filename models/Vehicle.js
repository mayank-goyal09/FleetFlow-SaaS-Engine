const mongoose = require('mongoose');

// The Blueprint (Schema)
const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['Available', 'In-Transit', 'Maintenance', 'Retired'],
        default: 'Available'
    },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastServiceDate: { type: Date },
}, { timestamps: true });
 // Automatically adds createdAt and updatedAt fields

// The Power (Model)
module.exports = mongoose.model('Vehicle', vehicleSchema);