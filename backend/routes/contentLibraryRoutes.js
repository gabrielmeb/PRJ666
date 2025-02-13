const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  addContent,
  getAllContent,
  getContentByCategory,
  updateContent,
  deleteContent
} = require("../controllers/contentLibraryController");

const router = express.Router();

// Add new content (Admin & SuperAdmin only)
router.post(
  "/",
  protect,
  authorize("Admin", "SuperAdmin"),
  validateRequest([
    body("title").notEmpty().withMessage("Title is required"),
    body("category").isIn(["Fitness", "Finance", "Productivity", "Mental Health"]).withMessage("Invalid category"),
    body("url").isURL().withMessage("Valid URL is required")
  ]),
  addContent
);

// Get all content (Public)
router.get("/", getAllContent);

// Get content by category (Public)
router.get("/category/:category", getContentByCategory);

// Update content (Admin & SuperAdmin only)
router.put(
  "/:contentId",
  protect,
  authorize("Admin", "SuperAdmin"),
  validateRequest([
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("category").optional().isIn(["Fitness", "Finance", "Productivity", "Mental Health"]).withMessage("Invalid category"),
    body("url").optional().isURL().withMessage("Valid URL is required")
  ]),
  updateContent
);

// Delete content (Admin & SuperAdmin only)
router.delete("/:contentId", protect, authorize("Admin", "SuperAdmin"), deleteContent);

module.exports = router;
