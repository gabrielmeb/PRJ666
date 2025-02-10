const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");

// @desc    Get user profile by user ID
// @route   GET /api/user-profiles/:userId
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.params.userId }).populate("user_id", "-password");

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user-profiles/:userId
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { strengths, areas_for_growth, goals, progress } = req.body;

    const profile = await UserProfile.findOne({ user_id: req.params.userId });

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    // Update fields if provided
    profile.strengths = strengths || profile.strengths;
    profile.areas_for_growth = areas_for_growth || profile.areas_for_growth;
    profile.goals = goals || profile.goals;
    profile.progress = progress || profile.progress;

    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all user profiles (Admin Only)
// @route   GET /api/user-profiles
// @access  Private (Admin only)
const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile.find().populate("user_id", "-password");

    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user profile (Admin Only)
// @route   DELETE /api/user-profiles/:userId
// @access  Private (Admin only)
const deleteUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.params.userId });

    if (!profile) return res.status(404).json({ message: "User profile not found" });

    await profile.remove();

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUserProfiles,
  deleteUserProfile,
};
