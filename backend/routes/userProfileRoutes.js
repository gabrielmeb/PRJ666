const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles,
  deleteUserProfile,
} = require("../controllers/userProfileController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes (User Auth Required)
router.get("/:userId", protect, getUserProfile); // Get User Profile
router.put("/:userId", protect, updateUserProfile); // Update User Profile

// Admin Routes
router.get("/", protect, adminOnly, getAllUserProfiles); // Get All Profiles
router.delete("/:userId", protect, adminOnly, deleteUserProfile); // Delete Profile

module.exports = router;
