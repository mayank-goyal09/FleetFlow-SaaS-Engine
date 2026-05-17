const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Shipment = require('./models/Shipment');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    // 1. Get ALL Users (so we can populate data for whoever is logged in)
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found in the database. Creating default manager...');
      const manager = await User.create({
        name: 'Fleet Manager',
        email: 'manager@fleetflow.com',
        password: 'password123',
        role: 'manager'
      });
      users.push(manager);
    }

    console.log(`Found ${users.length} users. Populating data for all of them...`);

    for (const manager of users) {
      const pfx = manager._id.toString().substring(0, 4).toUpperCase();
      const rand = Math.floor(Math.random() * 10000).toString();

      // Clear previous test data to prevent duplicates
      await Vehicle.deleteMany({ manager: manager._id });
      await Driver.deleteMany({ manager: manager._id });
      await Shipment.deleteMany({ manager: manager._id });

      // 3. Create Vehicles & Drivers
      const vehicles = await Vehicle.create([
        { make: 'Tesla', model: 'Semi', licensePlate: `${pfx}-${rand}-EV-TRK-01`, status: 'In-Transit', manager: manager._id, currentLocation: { lat: 25.2048, lng: 55.2708 } },
        { make: 'Ford', model: 'F-150', licensePlate: `${pfx}-${rand}-FORD-002`, status: 'Available', manager: manager._id },
        { make: 'Volvo', model: 'FH16', licensePlate: `${pfx}-${rand}-VOL-789`, status: 'Maintenance', manager: manager._id }
      ]);

      const drivers = await Driver.create([
        { name: 'Mayank Goyal', licenseNumber: `${pfx}-${rand}-DL-9999`, email: `mayank${pfx}${rand}@example.com`, phone: `987${pfx}${rand}`, status: 'On-Trip', manager: manager._id },
        { name: 'Alex Rider', licenseNumber: `${pfx}-${rand}-DL-1111`, email: `alex${pfx}${rand}@example.com`, phone: `123${pfx}${rand}`, status: 'Available', manager: manager._id }
      ]);

      // 4. Create Consolidation Candidates (3 shipments to the same sector)
      await Shipment.create([
        {
          trackingNumber: `${pfx}-TEST-CON-001`,
          origin: 'Mumbai',
          destination: 'Delhi Sector 5, Block A',
          status: 'Pending',
          manager: manager._id,
          customerName: 'Test Customer 1',
          customerEmail: 'test1@example.com'
        },
        {
          trackingNumber: `${pfx}-TEST-CON-002`,
          origin: 'Pune',
          destination: 'Delhi Sector 5, Block B',
          status: 'Pending',
          manager: manager._id,
          customerName: 'Test Customer 2',
          customerEmail: 'test2@example.com'
        },
        {
          trackingNumber: `${pfx}-TEST-CON-003`,
          origin: 'Ahmedabad',
          destination: 'Delhi Sector 5, Block C',
          status: 'Pending',
          manager: manager._id,
          customerName: 'Test Customer 3',
          customerEmail: 'test3@example.com'
        }
      ]);

      // 5. Create Performance Data (On-time and Late deliveries)
      const now = Date.now();
      await Shipment.create([
        {
          trackingNumber: `${pfx}-PERF-OK-001`,
          origin: 'UAE', destination: 'Mumbai',
          status: 'Delivered',
          manager: manager._id,
          customerName: 'Success Case',
          customerEmail: 'success@example.com',
          estimatedDelivery: new Date(now + 86400000), // Tomorrow
          deliveredAt: new Date(now) // Today (On-time)
        },
        {
          trackingNumber: `${pfx}-PERF-LATE-001`,
          origin: 'Delhi', destination: 'Dubai',
          status: 'Delivered',
          manager: manager._id,
          customerName: 'Late Case',
          customerEmail: 'late@example.com',
          estimatedDelivery: new Date(now - 86400000), // Yesterday
          deliveredAt: new Date(now) // Today (Late)
        }
      ]);

      // 6. Create Active Trip for Map & Forecast
      await Shipment.create({
        trackingNumber: `${pfx}-ACTIVE-TRIP-001`,
        origin: 'UAE',
        destination: 'Delhi',
        status: 'In-Transit',
        manager: manager._id,
        customerName: 'Active User',
        customerEmail: 'active@example.com',
        assignedVehicle: vehicles[0]._id,
        assignedDriver: drivers[0]._id
      });
    } // End of user loop

    console.log('✅ Advanced Test Data Seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
