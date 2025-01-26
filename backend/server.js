const express = require('express');
const cors = require('cors');
const passport = require('./middleware/authentication');
const { connectMongoDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Route setup
app.use('/api/book', bookRoutes);
app.use('/api/user', userRoutes);

const startServer = async () => {
  try {
    await connectMongoDB();

    const HTTP_PORT = process.env.PORT || 8080;
    app.listen(HTTP_PORT, () => {
      console.log(`Server running on: http://localhost:${HTTP_PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();