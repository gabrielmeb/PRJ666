require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const dbConnect = require("./config/db");
const cloudinary = require("./config/cloudinary");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { limiter } = require("./middleware/rateLimitMiddleware")


// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const goalRoutes = require("./routes/goalRoutes");
const progressRoutes = require("./routes/progressRoutes");
const communityRoutes = require("./routes/communityRoutes");
const userCommunityRoutes = require("./routes/userCommunityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contentRoutes = require("./routes/contentLibraryRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");

// Initialize Express App
const app = express();

// Database Connection
dbConnect();

// Ensure Cloudinary is properly initialized
cloudinary.uploader.upload("https://res.cloudinary.com/bebetter-images/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1739482059/person_gurqyi.png", (error, result) => {
  if (error) {
    console.error("❌ Cloudinary Initialization Failed:", error);
  } else {
    console.log("✅ Cloudinary is connected successfully!");
  }
});

// Middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors()); // Enable CORS for frontend communication
app.use(helmet()); // Set security headers
app.use(morgan("dev")); // Log API requests
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xssClean()); // Prevent XSS attacks
app.use("/api", limiter); // Rate Limiting (Prevent abuse)

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/user-communities", userCommunityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/user-profiles", userProfileRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
