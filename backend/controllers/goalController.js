const Goal = require("../models/goalModel");
const User = require("../models/userModel");
const Progress = require("../models/progressModel");

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user._id;

    if (!description) {
      return res.status(400).json({ message: "Goal description is required" });
    }

    const newGoal = await Goal.create({
      user_id: userId,
      description,
      status: "Pending",
      progress: [],
    });

    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all goals (Admin Only)
// @route   GET /api/goals
// @access  Private (Admin Only)
const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find().populate("user_id", "-password");
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get goals by user ID
// @route   GET /api/goals/user/:userId
// @access  Private
const getGoalsByUserId = async (req, res) => {
  try {
    const goals = await Goal.find({ user_id: req.params.userId });

    if (!goals.length) {
      return res.status(404).json({ message: "No goals found for this user" });
    }

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update goal details
// @route   PUT /api/goals/:goalId
// @access  Private
const updateGoal = async (req, res) => {
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

    goal.status = status || goal.status;
    goal.progress = progress || goal.progress;

    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:goalId
// @access  Private
const deleteGoal = async (req, res) => {
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createGoal,
  getAllGoals,
  getGoalsByUserId,
  updateGoal,
  deleteGoal,
};
