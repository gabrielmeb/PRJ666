const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles,
  deleteUserProfile
} = require("../controllers/userProfileController");

const router = express.Router();

// Get user profile by user ID (Users can view their own profile)
router.get("/:userId", protect, getUserProfile);

// Update user profile (Users can update their own profile)
router.put(
  "/:userId",
  protect,
  validateRequest([
    body("strengths").optional().isArray().withMessage("Strengths must be an array"),
    body("areas_for_growth").optional().isArray().withMessage("Areas for growth must be an array"),
    body("goals").optional().isArray().withMessage("Goals must be an array"),
    body("progress").optional().isArray().withMessage("Progress must be an array")
  ]),
  updateUserProfile
);

// Get all user profiles (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllUserProfiles);

// Delete a user profile (Admins & Users)
router.delete("/:userId", protect, deleteUserProfile);

module.exports = router;
