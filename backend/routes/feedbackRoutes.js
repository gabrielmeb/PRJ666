const express = require("express");
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  deleteFeedback,
} = require("../controllers/feedbackController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/", protect, submitFeedback);
router.get("/user/:userId", protect, getFeedbackByUserId);
router.delete("/:feedbackId", protect, deleteFeedback);

// Admin Routes
router.get("/", protect, adminOnly, getAllFeedback);

module.exports = router;
