const Feedback = require("../models/feedbackModel");
const { validationResult } = require("express-validator");

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, rating } = req.body;
    const userId = req.user._id;

    const newFeedback = await Feedback.create({
      user_id: userId,
      content,
      rating
    });

    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (Admin Only, with Pagination)
// @route   GET /api/feedback
// @access  Private (Admin Only)
const getAllFeedback = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can view feedback." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find()
      .populate("user_id", "first_name last_name email")
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: feedbacks.length, feedbacks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback by user ID
// @route   GET /api/feedback/user/:userId
// @access  Private
const getFeedbackByUserId = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ user_id: req.params.userId }).lean();

    if (!feedbacks.length) {
      return res.status(404).json({ message: "No feedback found for this user" });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:feedbackId
// @access  Private
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Ensure only the owner or admin can delete feedback
    if (feedback.user_id.toString() !== req.user._id.toString() && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Unauthorized to delete this feedback" });
    }

    await feedback.remove();
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  deleteFeedback
};
