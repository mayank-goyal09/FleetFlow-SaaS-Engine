const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("❌ Error: MONGO_URI not found in .env file. Please ensure it looks like: MONGO_URI=mongodb+srv://...");
    process.exit(1);
}

console.log("🚀 Attempting to connect to MongoDB Atlas...");

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS: MongoDB Connected perfectly!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILURE: Could not connect to MongoDB.");
        console.error("Error Detail:", err.message);
        
        if (err.message.includes('IP not whitelisted')) {
            console.log("\n💡 TIP: Your IP address is not whitelisted in MongoDB Atlas. Go to Network Access and add '0.0.0.0/0' (for testing) or your current IP.");
        } else if (err.message.includes('Authentication failed')) {
            console.log("\n💡 TIP: The password in your .env file might be incorrect.");
        }
        
        process.exit(1);
    });
