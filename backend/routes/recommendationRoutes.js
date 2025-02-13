const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  createRecommendation,
  getAllRecommendations,
  getRecommendationsByUserId,
  updateRecommendationFeedback,
  deleteRecommendation
} = require("../controllers/recommendationController");

const router = express.Router();

// Create a recommendation (User only)
router.post(
  "/",
  protect,
  validateRequest([
    body("type").isIn(["Product", "Service", "Community"]).withMessage("Invalid recommendation type"),
    body("content").notEmpty().withMessage("Content is required")
  ]),
  createRecommendation
);

// Get all recommendations (Admin & SuperAdmin only)
router.get("/", protect, authorize("Admin", "SuperAdmin"), getAllRecommendations);

// Get recommendations for a user (Users only)
router.get("/user/:userId", protect, getRecommendationsByUserId);

// Update recommendation feedback (Users only)
router.put(
  "/:recommendationId",
  protect,
  validateRequest([
    body("feedback").notEmpty().withMessage("Feedback cannot be empty")
  ]),
  updateRecommendationFeedback
);

// Delete a recommendation (Users & SuperAdmin)
router.delete("/:recommendationId", protect, deleteRecommendation);

module.exports = router;
