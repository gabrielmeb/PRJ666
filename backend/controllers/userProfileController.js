const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");

// @desc    Get user profile by user ID
// @route   GET /api/user-profiles/:userId
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.params.userId })
      .populate("user_id", "-password")
      .populate("goals")
      .populate("progress")
      .lean();

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user-profiles/:userId
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { strengths, areas_for_growth, goals, progress } = req.body;

    const profile = await UserProfile.findOne({ user_id: req.params.userId });

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    // Update fields only if provided
    if (strengths) profile.strengths = strengths;
    if (areas_for_growth) profile.areas_for_growth = areas_for_growth;
    if (goals) profile.goals = goals;
    if (progress) profile.progress = progress;

    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user profiles (Admin Only)
// @route   GET /api/user-profiles
// @access  Private (Admin only)
const getAllUserProfiles = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can view profiles." });
    }

    const profiles = await UserProfile.find()
      .populate("user_id", "-password")
      .lean();

    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile (Admin Only)
// @route   DELETE /api/user-profiles/:userId
// @access  Private (Admin only)
const deleteUserProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied. Only admins can delete profiles." });
    }

    const profile = await UserProfile.findOne({ user_id: req.params.userId });

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    await profile.deleteOne();
    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user profile (Ensures only one profile per user)
// @route   POST /api/user-profiles
// @access  Private
const createUserProfile = async (req, res, next) => {
  try {
    const { user_id, strengths, areas_for_growth, goals, progress } = req.body;

    const userExists = await User.findById(user_id);
    if (!userExists) return res.status(400).json({ message: "User not found" });

    const profileExists = await UserProfile.findOne({ user_id });
    if (profileExists) return res.status(400).json({ message: "User profile already exists" });

    const newProfile = await UserProfile.create({
      user_id,
      strengths: strengths || [],
      areas_for_growth: areas_for_growth || [],
      goals: goals || [],
      progress: progress || []
    });

    res.status(201).json({ message: "User profile created successfully", profile: newProfile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles,
  deleteUserProfile,
  createUserProfile
};
