const Community = require("../models/communityModel");
const { validationResult } = require("express-validator");

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private (Admin Only)
const createCommunity = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, tags } = req.body;

    // Check if community name is already in use
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    const newCommunity = await Community.create({ name, description, tags });

    res.status(201).json({ message: "Community created successfully", community: newCommunity });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all communities with pagination
// @route   GET /api/communities
// @access  Public
const getAllCommunities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const communities = await Community.find()
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: communities.length, communities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a community by ID
// @route   GET /api/communities/:communityId
// @access  Public
const getCommunityById = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.communityId).lean();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.status(200).json(community);
  } catch (error) {
    next(error);
  }
};

// @desc    Update community details
// @route   PUT /api/communities/:communityId
// @access  Private (Admin Only)
const updateCommunity = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    next(error);
  }
};

// @desc    Delete a community
// @route   DELETE /api/communities/:communityId
// @access  Private (Admin Only)
const deleteCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    await community.remove();
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity
};
