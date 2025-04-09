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

// 🔹 Update user details (Admins & Users) - Supports Profile Image Uploads
router.put(
  "/:id",
  protect,
  upload.single("profile_image"),
  validateRequest([
    body("first_name").optional().notEmpty().withMessage("First name cannot be empty"),
    body("last_name").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("date_of_birth").optional().isISO8601().withMessage("Invalid date format"),
    body("preferences")  .optional()  .custom((value) => {
    // If value is a string, try to parse it as JSON and check it's an array.
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("Preferences must be an array");
        }
      } catch (error) {
        throw new Error("Preferences must be a valid JSON array");
      }
    } else if (!Array.isArray(value)) {
      // If it's not a string, it must be an array.
      throw new Error("Preferences must be an array");
    }
    return true;
  })

  ]),
  updateUser
);

// Delete user (SuperAdmin can delete any user, users can delete themselves)
router.delete("/:id", protect, deleteUser);

module.exports = router;
