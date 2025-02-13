const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Generate JWT Token for Admin
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// @desc    Register a new admin (Super Admin Only)
// @route   POST /api/admins/register
// @access  Private (Super Admin Only)
const registerAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;


    if (!req.admin || !req.admin.role) {
      return res.status(401).json({ message: "Unauthorized: No admin role detected" });
    }
    
    if (req.admin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only Super Admins can add new admins." });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin with this email already exists." });
    }

    const newAdmin = await Admin.create({ name, email, password, role });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/admins/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token: generateToken(admin),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins (Super Admin Only)
// @route   GET /api/admins
// @access  Private (Super Admin Only)
const getAllAdmins = async (req, res, next) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only Super Admins can view admins." });
    }

    const admins = await Admin.find().select("-password").lean();
    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin by ID (Super Admin Only)
// @route   GET /api/admins/:id
// @access  Private (Super Admin Only)
const getAdminById = async (req, res, next) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only Super Admins can view an admin." });
    }

    const admin = await Admin.findById(req.params.id).select("-password").lean();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin role (Super Admin Only)
// @route   PUT /api/admins/:id
// @access  Private (Super Admin Only)
const updateAdminRole = async (req, res, next) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only Super Admins can update roles." });
    }

    const { role } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.role = role || admin.role;
    await admin.save();

    res.status(200).json({ message: "Admin role updated successfully", admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admin (Super Admin Only)
// @route   DELETE /api/admins/:id
// @access  Private (Super Admin Only)
const deleteAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only Super Admins can delete an admin." });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent self-deletion
    if (req.user.id === admin._id.toString()) {
      return res.status(400).json({ message: "SuperAdmin cannot delete themselves." });
    }

    await admin.deleteOne();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminRole,
  deleteAdmin,
};
