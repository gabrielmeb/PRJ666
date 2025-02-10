const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getUsersByFirstName,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", registerUser); // Register User
router.post("/login", loginUser); // Login User

// Protected Routes (Require Authentication)
router.get("/", protect, adminOnly, getAllUsers); // Get All Users (Admin Only)
router.get("/:id", protect, getUserById); // Get User by ID
router.get("/search/:firstName", protect, getUsersByFirstName); // Search User by First Name
router.put("/:id", protect, updateUser); // Update User
router.delete("/:id", protect, adminOnly, deleteUser); // Delete User (Admin Only)

module.exports = router;
