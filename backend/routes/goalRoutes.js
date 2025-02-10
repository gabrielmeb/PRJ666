const express = require("express");
const {
  createGoal,
  getAllGoals,
  getGoalsByUserId,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes (User Auth Required)
router.post("/", protect, createGoal); // Create Goal
router.get("/user/:userId", protect, getGoalsByUserId); // Get User Goals
router.put("/:goalId", protect, updateGoal); // Update Goal
router.delete("/:goalId", protect, deleteGoal); // Delete Goal

// Admin Routes
router.get("/", protect, adminOnly, getAllGoals); // Get All Goals (Admin Only)

module.exports = router;
