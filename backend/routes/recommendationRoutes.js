const express = require("express");
const {
  createRecommendation,
  getAllRecommendations,
  getRecommendationsByUserId,
  updateRecommendationFeedback,
  deleteRecommendation,
} = require("../controllers/recommendationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes (User Auth Required)
router.post("/", protect, createRecommendation); // Create Recommendation
router.get("/user/:userId", protect, getRecommendationsByUserId); // Get Recommendations by User ID
router.put("/:recommendationId", protect, updateRecommendationFeedback); // Update Feedback
router.delete("/:recommendationId", protect, deleteRecommendation); // Delete Recommendation

// Admin Routes
router.get("/", protect, adminOnly, getAllRecommendations); // Get All Recommendations (Admin Only)

module.exports = router;
