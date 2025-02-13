const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  createProgress,
  getAllProgress,
  getProgressByUserId,
  getProgressByGoalId,
  updateProgress,
  deleteProgress
} = require("../controllers/progressController");

const router = express.Router();

// Create a new progress entry (User only)
router.post(
  "/",
  protect,
  validateRequest([
    body("goal_id").notEmpty().withMessage("Goal ID is required"),
    body("progress_percentage").isInt({ min: 0, max: 100 }).withMessage("Progress percentage must be between 0 and 100"),
    body("milestones").optional().isArray().withMessage("Milestones must be an array")
  ]),
  createProgress
);

// Get all progress data (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllProgress);

// Get progress by user ID (Users & Admins)
router.get("/user/:userId", protect, getProgressByUserId);

// Get progress by goal ID (Users & Admins)
router.get("/goal/:goalId", protect, getProgressByGoalId);

// Update progress (Only the owner can update)
router.put(
  "/:progressId",
  protect,
  validateRequest([
    body("progress_percentage").optional().isInt({ min: 0, max: 100 }).withMessage("Progress percentage must be between 0 and 100"),
    body("milestones").optional().isArray().withMessage("Milestones must be an array")
  ]),
  updateProgress
);

// Delete progress (Only the owner can delete)
router.delete("/:progressId", protect, deleteProgress);

module.exports = router;
