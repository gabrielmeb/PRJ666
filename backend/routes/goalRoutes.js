const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  createGoal,
  getAllGoals,
  getGoalsByUserId,
  updateGoal,
  deleteGoal
} = require("../controllers/goalController");

const router = express.Router();

// Create a new goal (User only)
router.post(
  "/",
  protect,
  validateRequest([
    body("description").notEmpty().withMessage("Goal description is required")
  ]),
  createGoal
);

// Get all goals (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllGoals);

// Get goals by user ID (Users & Admins)
router.get("/user/:userId", protect, getGoalsByUserId);

// Update a goal (Only the goal owner can update)
router.put(
  "/:goalId",
  protect,
  validateRequest([
    body("status").optional().isIn(["Pending", "In Progress", "Completed"]).withMessage("Invalid goal status"),
    body("progress").optional().isArray().withMessage("Progress must be an array")
  ]),
  updateGoal
);

// Delete a goal (Only the goal owner can delete)
router.delete("/:goalId", protect, deleteGoal);

module.exports = router;
