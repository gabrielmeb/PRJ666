const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token for Admin
const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc    Register a new admin (Super Admin Only)
// @route   POST /api/admins/register
// @access  Private (Super Admin Only)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Ensure only Super Admins can register new admins
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied, only Super Admins can add new admins" });
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Admin with this email already exists" });

    // Create new admin
    const newAdmin = await Admin.create({ name, email, password, role });

    res.status(201).json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/admins/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate admin
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid email or password" });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all admins (Super Admin Only)
// @route   GET /api/admins
// @access  Private (Super Admin Only)
const getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied, only Super Admins can view admins" });
    }

    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get admin by ID (Super Admin Only)
// @route   GET /api/admins/:id
// @access  Private (Super Admin Only)
const getAdminById = async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied, only Super Admins can view an admin" });
    }

    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update admin role (Super Admin Only)
// @route   PUT /api/admins/:id
// @access  Private (Super Admin Only)
const updateAdminRole = async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied, only Super Admins can update roles" });
    }

    const { role } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.role = role || admin.role;
    await admin.save();

    res.status(200).json({ message: "Admin role updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete admin (Super Admin Only)
// @route   DELETE /api/admins/:id
// @access  Private (Super Admin Only)
const deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied, only Super Admins can delete an admin" });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.remove();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
