const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  deleteFeedback
} = require("../controllers/feedbackController");

const router = express.Router();

// Submit feedback (Users only)
router.post(
  "/",
  protect,
  validateRequest([
    body("content").notEmpty().withMessage("Feedback content is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")
  ]),
  submitFeedback
);

// Get all feedback (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllFeedback);

// Get feedback by user ID (Users can view their own feedback)
router.get("/user/:userId", protect, getFeedbackByUserId);

// Delete feedback (Users can delete their own, Admins can delete any)
router.delete("/:feedbackId", protect, deleteFeedback);

module.exports = router;
