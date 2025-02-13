const express = require("express");
const { protectAdmin, authorizeAdmin } = require("../middleware/adminMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  loginAdmin,
  registerAdmin
} = require("../controllers/adminController");

const {
  loginUser,
  registerUser
} = require("../controllers/userController");

const router = express.Router();

// Admin Login (SuperAdmin, Admin, Moderator)
router.post(
  "/admin/login",
  validateRequest([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ]),
  loginAdmin
);

// SuperAdmin Only: Register a new admin
router.post(
  "/admin/register",
  protectAdmin,
  authorizeAdmin("SuperAdmin"),
  validateRequest([
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["SuperAdmin", "Admin", "Moderator"]).withMessage("Invalid role")
  ]),
  registerAdmin
);

// User Login
router.post(
  "/user/login",
  validateRequest([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ]),
  loginUser
);

// User Registration
router.post(
  "/user/register",
  validateRequest([
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ]),
  registerUser
);

module.exports = router;
