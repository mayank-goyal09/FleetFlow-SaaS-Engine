const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorMiddleware');


dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/stats', statsRoutes);


app.get('/', (req, res) => {
    res.send('Logistics API is running in MVC mode...');
});

// Error Handler Middleware (Must be after all routes)
app.use(errorHandler);

// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
if (!process.env.MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables!");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });
