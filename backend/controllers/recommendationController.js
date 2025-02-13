const Recommendation = require("../models/recommendationModel");
const { validationResult } = require("express-validator");

// @desc    Create a recommendation (AI/ML System)
// @route   POST /api/recommendations
// @access  Private
const createRecommendation = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, content } = req.body;
    const userId = req.user._id;

    const newRecommendation = await Recommendation.create({
      user_id: userId,
      type,
      content
    });

    res.status(201).json({ message: "Recommendation generated successfully", recommendation: newRecommendation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recommendations (Admin Only, with Pagination)
// @route   GET /api/recommendations
// @access  Private (Admin Only)
const getAllRecommendations = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can view recommendations." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await Recommendation.find()
      .populate("user_id", "-password")
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: recommendations.length, recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations by user ID
// @route   GET /api/recommendations/user/:userId
// @access  Private
const getRecommendationsByUserId = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ user_id: req.params.userId }).lean();

    if (!recommendations.length) {
      return res.status(404).json({ message: "No recommendations found for this user" });
    }

    res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
};

// @desc    Update recommendation feedback
// @route   PUT /api/recommendations/:recommendationId
// @access  Private
const updateRecommendationFeedback = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    next(error);
  }
};

// @desc    Delete a recommendation
// @route   DELETE /api/recommendations/:recommendationId
// @access  Private
const deleteRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findById(req.params.recommendationId);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Ensure that only the owner or an admin can delete
    if (recommendation.user_id.toString() !== req.user._id.toString() && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Unauthorized to delete this recommendation" });
    }

    await recommendation.remove();
    res.status(200).json({ message: "Recommendation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecommendation,
  getAllRecommendations,
  getRecommendationsByUserId,
  updateRecommendationFeedback,
  deleteRecommendation
};
