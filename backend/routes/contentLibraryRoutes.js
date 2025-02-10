const express = require("express");
const {
  addContent,
  getAllContent,
  getContentByCategory,
  updateContent,
  deleteContent,
} = require("../controllers/contentLibraryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", getAllContent);
router.get("/category/:category", getContentByCategory);

// Admin Routes
router.post("/", protect, adminOnly, addContent);
router.put("/:contentId", protect, adminOnly, updateContent);
router.delete("/:contentId", protect, adminOnly, deleteContent);

module.exports = router;
