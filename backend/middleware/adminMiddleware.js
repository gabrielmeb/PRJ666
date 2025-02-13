const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

// Middleware to verify if the request comes from an authenticated admin
const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({ message: "Admin not found, authentication failed" });
      }

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token, authentication failed" });
  }
};

// Role-based access control (RBAC)
const authorizeAdmin = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Access denied, insufficient permissions" });
    }
    next();
  };
};

module.exports = { protectAdmin, authorizeAdmin };
