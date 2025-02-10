const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminRole,
  deleteAdmin,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/login", loginAdmin);

// Super Admin Routes
router.post("/register", protect, adminOnly, registerAdmin);
router.get("/", protect, adminOnly, getAllAdmins);
router.get("/:id", protect, adminOnly, getAdminById);
router.put("/:id", protect, adminOnly, updateAdminRole);
router.delete("/:id", protect, adminOnly, deleteAdmin);

module.exports = router;
