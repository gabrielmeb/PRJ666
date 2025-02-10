const Recommendation = require("../models/recommendationModel");
const User = require("../models/userModel");

// @desc    Create a recommendation (AI/ML System)
// @route   POST /api/recommendations
// @access  Private
const createRecommendation = async (req, res) => {
  try {
    const { type, content } = req.body;
    const userId = req.user._id;

    if (!type || !content) {
      return res.status(400).json({ message: "Type and content are required" });
    }

    const newRecommendation = await Recommendation.create({
      user_id: userId,
      type,
      content,
    });

    res.status(201).json({ message: "Recommendation generated successfully", recommendation: newRecommendation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all recommendations (Admin Only)
// @route   GET /api/recommendations
// @access  Private (Admin Only)
const getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find().populate("user_id", "-password");
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get recommendations by user ID
// @route   GET /api/recommendations/user/:userId
// @access  Private
const getRecommendationsByUserId = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ user_id: req.params.userId });

    if (!recommendations.length) {
      return res.status(404).json({ message: "No recommendations found for this user" });
    }

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update recommendation feedback
// @route   PUT /api/recommendations/:recommendationId
// @access  Private
const updateRecommendationFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const recommendation = await Recommendation.findById(req.params.recommendationId);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Ensure that only the owner can update feedback
    if (recommendation.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this recommendation" });
    }

    recommendation.feedback = feedback || recommendation.feedback;

    await recommendation.save();
    res.status(200).json({ message: "Recommendation feedback updated", recommendation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a recommendation
// @route   DELETE /api/recommendations/:recommendationId
// @access  Private
const deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.recommendationId);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Ensure that only the owner or an admin can delete
    if (recommendation.user_id.toString() !== req.user._id.toString() && req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Unauthorized to delete this recommendation" });
    }

    await recommendation.remove();
    res.status(200).json({ message: "Recommendation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRecommendation,
  getAllRecommendations,
  getRecommendationsByUserId,
  updateRecommendationFeedback,
  deleteRecommendation,
};
