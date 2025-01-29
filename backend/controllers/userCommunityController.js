const UserCommunity = require("../models/userCommunityModel");
const Community = require("../models/communityModel");

// @desc    Join a community
// @route   POST /api/user-communities
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const { community_id } = req.body;
    const userId = req.user._id;

    // Check if community exists
    const community = await Community.findById(community_id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is already a member
    const existingMembership = await UserCommunity.findOne({ user_id: userId, community_id });
    if (existingMembership) {
      return res.status(400).json({ message: "You are already a member of this community" });
    }

    const newMembership = await UserCommunity.create({ user_id: userId, community_id });

    res.status(201).json({ message: "Joined community successfully", membership: newMembership });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Leave a community
// @route   DELETE /api/user-communities/:communityId
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const membership = await UserCommunity.findOneAndDelete({ user_id: userId, community_id: communityId });

    if (!membership) {
      return res.status(404).json({ message: "Not a member of this community" });
    }

    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all users in a community
// @route   GET /api/user-communities/community/:communityId
// @access  Private
const getUsersInCommunity = async (req, res) => {
  try {
    const members = await UserCommunity.find({ community_id: req.params.communityId }).populate("user_id", "-password");
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all communities a user joined
// @route   GET /api/user-communities/user
// @access  Private
const getUserCommunities = async (req, res) => {
  try {
    const userCommunities = await UserCommunity.find({ user_id: req.user._id }).populate("community_id");
    res.status(200).json(userCommunities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  joinCommunity,
  leaveCommunity,
  getUsersInCommunity,
  getUserCommunities,
};
