const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  addContent,
  getTotalContentItems,
  getAllCategories,       // New endpoint: get all distinct categories
  getMostPopularCategories,
  getAllContent,
  getContentByCategory,
  getRecentContent,
  searchContent,         // New endpoint: search content by title or description
  updateContent,
  deleteContent
} = require("../controllers/contentLibraryController");

const router = express.Router();

// POST /api/content - Add new content (Admin & SuperAdmin only)
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

// GET /api/content/categories - Get all distinct content categories (Public)
router.get("/categories", getAllCategories);

// GET /api/content/search?q=query - Search content by title or description (Public)
router.get("/search", searchContent);

// GET /api/content - Get all content with pagination (Public)
router.get("/", getAllContent);

// GET /api/content/category/:category - Get content filtered by category (Public)
router.get("/category/:category", getContentByCategory);

// (Optional) GET /api/content/recent - Get recently added content (Public)
router.get("/recent", getRecentContent);

// PUT /api/content/:contentId - Update content (Admin & SuperAdmin only)
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

// DELETE /api/content/:contentId - Delete content (Admin & SuperAdmin only)
router.delete("/:contentId", protect, authorize("Admin", "SuperAdmin"), deleteContent);

module.exports = router;
