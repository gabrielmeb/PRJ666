const Progress = require("../models/progressModel");
const Goal = require("../models/goalModel");
const { validationResult } = require("express-validator");

// Helper: Convert an array of milestone strings into milestone objects.
// If a milestone is already an object with a title, leave it as is.
const convertMilestones = (milestones) => {
  if (!Array.isArray(milestones)) return [];
  return milestones.map((m) => {
    if (typeof m === "string") {
      return { title: m };
    }
    return m;
  });
};

// @desc    Create a progress entry
// @route   POST /api/progress
// @access  Private
const createProgress = async (req, res, next) => {
  try {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goal_id, progress_percentage, milestones, notes } = req.body;
    // Use current user's profile id: if available, otherwise use the user _id.
    const currentProfileId = req.user.profile
      ? req.user.profile.toString()
      : req.user._id.toString();

    // Find the goal and verify existence
    const goal = await Goal.findById(goal_id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    // Check ownership using goal.profile_id against currentProfileId
    if (goal.profile_id.toString() !== currentProfileId) {
      return res.status(403).json({
        message: "Unauthorized to add progress to this goal",
      });
    }

    // Convert milestones array (of strings) into array of objects with a title property.
    const newMilestones = milestones ? convertMilestones(milestones) : [];

    const newProgress = await Progress.create({
      profile_id: currentProfileId,
      goal_id,
      progress_percentage,
      milestones: newMilestones,
      notes,
    });

    return res
      .status(201)
      .json({ message: "Progress recorded successfully", progress: newProgress });
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
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can view progress." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const progress = await Progress.find()
      .populate("profile_id")
      .populate("goal_id")
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({ page, limit, count: progress.length, progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress by user ID (using profile_id)
// @route   GET /api/progress/user/:userId
// @access  Private
const getProgressByUserId = async (req, res, next) => {
  try {
    // Filter progress using the profile_id field.
    const progress = await Progress.find({ profile_id: req.params.userId })
      .populate("goal_id")
      .lean();

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this user" });
    }

    return res.status(200).json(progress);
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

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a progress entry
// @route   PUT /api/progress/:progressId
// @access  Private
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

    // Verify that the logged-in user's profile owns this progress entry.
    if (progress.profile_id.toString() !== currentProfileId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this progress entry" });
    }

    if (progress_percentage !== undefined) {
      progress.progress_percentage = Math.min(progress_percentage, 100);
    }

    // Replace milestones if provided (convert strings to milestone objects)
    if (milestones !== undefined) {
      progress.milestones = convertMilestones(milestones);
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    await progress.save();
    return res.status(200).json({ message: "Progress updated successfully", progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:progressId
// @access  Private
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
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this progress entry" });
    }

    // Use deleteOne() instead of remove()
    await progress.deleteOne();
    return res.status(200).json({ message: "Progress entry deleted successfully" });
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
  deleteProgress,
};
