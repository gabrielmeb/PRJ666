const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to protect routes (Require authentication)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Continue to next middleware
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

// Middleware to restrict access to admin-only routes
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Super Admin") {
    return res.status(403).json({ message: "Access denied, Admins only" });
  }
  next();
};

module.exports = { protect, adminOnly };
