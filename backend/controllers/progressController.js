const Progress = require("../models/progressModel");
const Goal = require("../models/goalModel");
const { validationResult } = require("express-validator");

// @desc    Create a progress entry
// @route   POST /api/progress
// @access  Private
// In progressController.js - createProgress
const createProgress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goal_id, progress_percentage, milestones, notes } = req.body;
    // Use current user's profile id
    const currentProfileId = req.user.profile
      ? req.user.profile.toString()
      : req.user._id.toString();

    const goal = await Goal.findById(goal_id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Check ownership using goal.profile_id against currentProfileId
    if (goal.profile_id.toString() !== currentProfileId) {
      return res.status(403).json({ message: "Unauthorized to add progress to this goal" });
    }

    const newProgress = await Progress.create({
      profile_id: currentProfileId,
      goal_id,
      progress_percentage,
      milestones: milestones || [],
      notes
    });

    res.status(201).json({ message: "Progress recorded successfully", progress: newProgress });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all progress entries (Admin Only, with Pagination)
// @route   GET /api/progress
// @access  Private (Admin Only)
const getAllProgress = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can view progress." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const progress = await Progress.find()
      .populate("user_id", "-password")
      .populate("goal_id")
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: progress.length, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress by user ID
// @route   GET /api/progress/user/:userId
// @access  Private
const getProgressByUserId = async (req, res, next) => {
  try {
    const progress = await Progress.find({ user_id: req.params.userId }).populate("goal_id").lean();

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this user" });
    }

    res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress by goal ID
// @route   GET /api/progress/goal/:goalId
// @access  Private
const getProgressByGoalId = async (req, res, next) => {
  try {
    const progress = await Progress.find({ goal_id: req.params.goalId }).lean();

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this goal" });
    }

    res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a progress entry
// @route   PUT /api/progress/:progressId
// @access  Private
// In progressController.js - updateProgress
const updateProgress = async (req, res, next) => {
  try {
    const { progress_percentage, milestones, notes } = req.body;
    const progress = await Progress.findById(req.params.progressId);

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    const currentProfileId = req.user.profile
      ? req.user.profile.toString()
      : req.user._id.toString();

    if (progress.profile_id.toString() !== currentProfileId) {
      return res.status(403).json({ message: "Unauthorized to update this progress entry" });
    }

    if (progress_percentage !== undefined) {
      progress.progress_percentage = Math.min(progress_percentage, 100);
    }
    if (milestones) {
      // Append milestones rather than replacing completely. Adjust according to your business logic.
      progress.milestones.push(...milestones);
    }
    if (notes) {
      progress.notes = notes;
    }

    await progress.save();
    res.status(200).json({ message: "Progress updated successfully", progress });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete a progress entry
// @route   DELETE /api/progress/:progressId
// @access  Private
// In progressController.js - deleteProgress
const deleteProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findById(req.params.progressId);

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    const currentProfileId = req.user.profile
      ? req.user.profile.toString()
      : req.user._id.toString();

    if (progress.profile_id.toString() !== currentProfileId) {
      return res.status(403).json({ message: "Unauthorized to delete this progress entry" });
    }

    await progress.remove();
    res.status(200).json({ message: "Progress entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createProgress,
  getAllProgress,
  getProgressByUserId,
  getProgressByGoalId,
  updateProgress,
  deleteProgress
};
