const express = require("express");
const {
  createProgress,
  getAllProgress,
  getProgressByUserId,
  getProgressByGoalId,
  updateProgress,
  deleteProgress,
} = require("../controllers/progressController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes (User Auth Required)
router.post("/", protect, createProgress); // Create Progress
router.get("/user/:userId", protect, getProgressByUserId); // Get Progress by User ID
router.get("/goal/:goalId", protect, getProgressByGoalId); // Get Progress by Goal ID
router.put("/:progressId", protect, updateProgress); // Update Progress
router.delete("/:progressId", protect, deleteProgress); // Delete Progress

// Admin Routes
router.get("/", protect, adminOnly, getAllProgress); // Get All Progress Entries (Admin Only)

module.exports = router;
