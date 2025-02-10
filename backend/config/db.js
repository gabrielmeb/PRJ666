require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
         // Exit the process if the connection fails
        process.exit(1);
    }
};

module.exports = connectDB;
