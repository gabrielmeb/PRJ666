const Feedback = require("../models/feedbackModel");

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { content, rating } = req.body;
    const userId = req.user._id;

    if (!content || !rating) {
      return res.status(400).json({ message: "Content and rating are required" });
    }

    const newFeedback = await Feedback.create({
      user_id: userId,
      content,
      rating,
    });

    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all feedback (Admin Only)
// @route   GET /api/feedback
// @access  Private (Admin Only)
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("user_id", "first_name last_name email");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get feedback by user ID
// @route   GET /api/feedback/user/:userId
// @access  Private
const getFeedbackByUserId = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user_id: req.params.userId });

    if (!feedbacks.length) {
      return res.status(404).json({ message: "No feedback found for this user" });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:feedbackId
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Ensure only the owner or admin can delete feedback
    if (feedback.user_id.toString() !== req.user._id.toString() && req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Unauthorized to delete this feedback" });
    }

    await feedback.remove();
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  deleteFeedback,
};
