const Progress = require("../models/progressModel");
const Goal = require("../models/goalModel");

// @desc    Create a progress entry
// @route   POST /api/progress
// @access  Private
const createProgress = async (req, res) => {
  try {
    const { goal_id, progress_percentage, milestones, notes } = req.body;
    const userId = req.user._id;

    // Validate goal
    const goal = await Goal.findById(goal_id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Check if user owns the goal
    if (goal.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to add progress to this goal" });
    }

    // Create progress entry
    const newProgress = await Progress.create({
      user_id: userId,
      goal_id,
      progress_percentage,
      milestones,
      notes,
    });

    res.status(201).json({ message: "Progress recorded successfully", progress: newProgress });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all progress entries (Admin Only)
// @route   GET /api/progress
// @access  Private (Admin Only)
const getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find().populate("user_id", "-password").populate("goal_id");
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get progress by user ID
// @route   GET /api/progress/user/:userId
// @access  Private
const getProgressByUserId = async (req, res) => {
  try {
    const progress = await Progress.find({ user_id: req.params.userId }).populate("goal_id");

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this user" });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get progress by goal ID
// @route   GET /api/progress/goal/:goalId
// @access  Private
const getProgressByGoalId = async (req, res) => {
  try {
    const progress = await Progress.find({ goal_id: req.params.goalId });

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this goal" });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a progress entry
// @route   PUT /api/progress/:progressId
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { progress_percentage, milestones, notes } = req.body;
    const progress = await Progress.findById(req.params.progressId);

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    // Only the user who created the progress entry can update it
    if (progress.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this progress entry" });
    }

    progress.progress_percentage = progress_percentage || progress.progress_percentage;
    progress.milestones = milestones || progress.milestones;
    progress.notes = notes || progress.notes;

    await progress.save();
    res.status(200).json({ message: "Progress updated successfully", progress });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:progressId
// @access  Private
const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.progressId);

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    // Only the user who created the progress entry can delete it
    if (progress.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this progress entry" });
    }

    await progress.remove();
    res.status(200).json({ message: "Progress entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
