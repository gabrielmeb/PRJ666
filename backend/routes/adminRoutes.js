const express = require("express");
const { protectAdmin, authorizeAdmin } = require("../middleware/adminMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");
const {
  getAllAdmins,
  getAdminById,
  registerAdmin,
  updateAdminProfile,
  updateAdminRole,
  deleteAdmin
} = require("../controllers/adminController");

const {
  getAllUsers,
  searchUsers,
  getUserById,
  deleteUser
} = require("../controllers/userController");

const {
  getAllCommunities,
  searchCommunities,
  createCommunity,
  deleteCommunity
} = require("../controllers/communityController");

const { sendNotification } = require("../controllers/notificationController");

const router = express.Router();

// SuperAdmin Only: Create a new admin
router.post("/register", protectAdmin, authorizeAdmin(["SuperAdmin"]), registerAdmin);

// SuperAdmin Only: Get all admins
router.get("/admins", protectAdmin, authorizeAdmin(["SuperAdmin","Admin","Moderator"]), getAllAdmins);

// SuperAdmin Only: Get a single admin by ID
router.get("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), getAdminById);

// SuperAdmin Only: Update admin role
router.put("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), updateAdminRole);

// Route to update own admin profile
router.put("/profile", protectAdmin, updateAdminProfile);

// SuperAdmin Only: Delete an admin
router.delete("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), deleteAdmin);

// All admins: Get all users
router.get("/users", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllUsers);

// All admins: Get users by id
router.get("/users/:id", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getUserById);

// Get user by first and last name
router.get("/users/search", protectAdmin,authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), searchUsers);

// SuperAdmin & Admin: Delete a user
router.delete("/users/:id", protectAdmin, authorizeAdmin(["SuperAdmin", "Admin"]), deleteUser);

// Admin & SuperAdmin: Get all communities
router.get("/communities", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllCommunities);

// search communities
router.get("/communities/search", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), searchCommunities);

router.post(  "/communities", protectAdmin,authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), validateRequest([
    body("name").notEmpty().withMessage("Community name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("tags").optional().isArray().withMessage("Tags must be an array")
  ]), createCommunity);

// SuperAdmin Only: Delete a community
router.delete("/communities/:communityId", protectAdmin, authorizeAdmin(["SuperAdmin", "Admin"]), deleteCommunity);

// Admin & SuperAdmin: View all notifications
// router.get("/notifications", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin"]), getAllNotifications);

// All admins: Send notifications
router.post("/notifications", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), sendNotification);

module.exports = router;
