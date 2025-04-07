const Goal = require("../models/goalModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description } = req.body;
    const userId = req.user._id;

    const newGoal = await Goal.create({
      profile_id: userId,
      description,
      status: "Pending",
      progress: null
    });

    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all goals (Admin Only, with Pagination)
// @route   GET /api/goals
// @access  Private (Admin Only)
const getAllGoals = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can view goals." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const goals = await Goal.find()
      .populate("user_id", "-password")
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goals by user ID
// @route   GET /api/goals/user/:userId
// @access  Private
const getGoalsByUserId = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user_id: req.params.userId }).lean();

    if (!goals.length) {
      return res.status(404).json({ message: "No goals found for this user" });
    }

    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal details
// @route   PUT /api/goals/:goalId
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const { status, progress } = req.body;
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Allow only the owner to update the goal
    if (goal.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this goal" });
    }

    if (status) goal.status = status;
    
    // Append new progress if provided instead of overwriting
    if (progress) {
      goal.progress.push(progress);
    }

    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:goalId
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Allow only the owner to delete the goal
    if (goal.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this goal" });
    }

    await goal.remove();
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:goalId/progress
// @access  Private
const updateGoalProgress = async (req, res, next) => {
  try {
    const { milestone, progress_percentage } = req.body;
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update progress" });
    }

    goal.progress.push({
      milestone,
      achieved: progress_percentage >= 100,
      progress_percentage: Math.min(progress_percentage, 100),
      date_achieved: progress_percentage >= 100 ? new Date() : null
    });

    await goal.save();
    res.status(200).json({ message: "Progress updated successfully", goal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGoal,
  getAllGoals,
  getGoalsByUserId,
  updateGoal,
  deleteGoal,
  updateGoalProgress
};
