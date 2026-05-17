const mongoose = require('mongoose');

// The Blueprint (Schema)
const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'In-Transit', 'Maintenance', 'Retired'],
        default: 'Available'
    },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastServiceDate: { type: Date },
    nextAvailableAt: { type: Date },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
// Automatically adds createdAt and updatedAt fields

// The Power (Model)
module.exports = mongoose.model('Vehicle', vehicleSchema);