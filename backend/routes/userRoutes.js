const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

// Get all users (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllUsers);

// Get a user by ID (User & Admins)
router.get("/:id", protect, getUserById);

// // Search users by first name (Users & Admins)
// router.get("/search/:firstName", protect, getUsersByFirstName);

// 🔹 Update user details (Admins & Users) - Supports Profile Image Uploads
router.put(
  "/:id",
  protect,
  upload.single("profile_image"),
  validateRequest([
    body("first_name").optional().notEmpty().withMessage("First name cannot be empty"),
    body("last_name").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("date_of_birth").optional().isISO8601().withMessage("Invalid date format"),
    body("preferences").optional().isArray().withMessage("Preferences must be an array")
  ]),
  updateUser
);

// Delete user (SuperAdmin can delete any user, users can delete themselves)
router.delete("/:id", protect, authorize("SuperAdmin", "User"), deleteUser);

module.exports = router;
