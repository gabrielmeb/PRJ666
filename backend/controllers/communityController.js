const Community = require("../models/communityModel");

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private (Admin Only)
const createCommunity = async (req, res) => {
  try {
    const { name, description, tags } = req.body;

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    const newCommunity = await Community.create({ name, description, tags });

    res.status(201).json({ message: "Community created successfully", community: newCommunity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a community by ID
// @route   GET /api/communities/:communityId
// @access  Public
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update community details
// @route   PUT /api/communities/:communityId
// @access  Private (Admin Only)
const updateCommunity = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    community.name = name || community.name;
    community.description = description || community.description;
    community.tags = tags || community.tags;

    await community.save();
    res.status(200).json({ message: "Community updated successfully", community });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a community
// @route   DELETE /api/communities/:communityId
// @access  Private (Admin Only)
const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    await community.remove();
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
};
