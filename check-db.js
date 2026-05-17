const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Shipment = require('./models/Shipment');
const dotenv = require('dotenv');

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.countDocuments();
    const vehicles = await Vehicle.countDocuments();
    const drivers = await Driver.countDocuments();
    const shipments = await Shipment.countDocuments();
    
    console.log('--- Database Status ---');
    console.log(`Users: ${users}`);
    console.log(`Vehicles: ${vehicles}`);
    console.log(`Drivers: ${drivers}`);
    console.log(`Shipments: ${shipments}`);
    
    if (shipments > 0) {
      const sample = await Shipment.findOne();
      console.log('Sample Shipment Manager:', sample.manager || 'MISSING');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
