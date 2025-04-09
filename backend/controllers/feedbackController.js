const Feedback = require("../models/feedbackModel");
const User = require("../models/userModel");
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

// @desc    Update feedback
// @route   PUT /api/feedback/:feedbackId
// @access  Private (User Only)
const updateFeedback = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Ensure only the owner can update feedback
    if (feedback.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this feedback" });
    }

    feedback.content = content || feedback.content;
    feedback.rating = rating !== undefined ? rating : feedback.rating;

    await feedback.save();
    res.status(200).json({ message: "Feedback updated successfully", feedback });
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

    const isOwner = feedback.user_id.toString() === req.user._id.toString();
    const isAdmin = ["Admin", "SuperAdmin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized to delete this feedback" });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get average rating of all feedback
// @route   GET /api/feedback/average-rating
// @access  Private (Admin Only)
const getAverageRating = async (req, res, next) => {
  try {
    const result = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const avgRating = result.length > 0 ? result[0].avgRating.toFixed(2) : 0;

    res.status(200).json({ averageRating: avgRating });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top-rated users based on feedback
// @route   GET /api/feedback/top-users
// @access  Private (Admin Only)
const getTopRatedUsers = async (req, res, next) => {
  try {
    const topUsers = await Feedback.aggregate([
      { $group: { _id: "$user_id", avgRating: { $avg: "$rating" }, feedbackCount: { $sum: 1 } } },
      { $sort: { avgRating: -1, feedbackCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
          email: "$user.email",
          avgRating: 1,
          feedbackCount: 1
        }
      }
    ]);

    res.status(200).json({ topUsers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics (total feedback, average rating, highest rating, lowest rating)
// @route   GET /api/feedback/stats
// @access  Private (Admin Only)
const getFeedbackStats = async (req, res, next) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          highestRating: { $max: "$rating" },
          lowestRating: { $min: "$rating" }
        }
      }
    ]);

    const stats = result.length > 0 ? result[0] : {
      totalFeedback: 0,
      avgRating: 0,
      highestRating: 0,
      lowestRating: 0
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  updateFeedback,
  deleteFeedback,
  getAverageRating,
  getTopRatedUsers,
  getFeedbackStats
};
