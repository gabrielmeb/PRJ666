const mongoose = require("mongoose");
const UserCommunity = require("../models/userCommunityModel");
const Community = require("../models/communityModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");

// @desc    Join a community
// @route   POST /api/user-communities
// @access  Private
const joinCommunity = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    next(error);
  }
};

// @desc    Leave a community
// @route   DELETE /api/user-communities/:communityId
// @access  Private
const leaveCommunity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const communityId = req.params.communityId;

    const membership = await UserCommunity.findOneAndDelete({ user_id: userId, community_id: communityId });

    if (!membership) {
      return res.status(404).json({ message: "Not a member of this community" });
    }

    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in a community with pagination
// @route   GET /api/user-communities/community/:communityId
// @access  Private
const getUsersInCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    // 1) Parse pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) Parse sorting
    let sortField = req.query.sortField || "joinedAt";
    let sortDirection = req.query.sortDirection || "asc";
    const direction = sortDirection === "asc" ? 1 : -1;

    // 3) Build the sort object
    let mongoSort;
    if (sortField === "name") {
      // Sort by userData.first_name and last_name
      mongoSort = { "userData.first_name": direction, "userData.last_name": direction };
    } else if (sortField === "email") {
      mongoSort = { "userData.email": direction };
    } else {
      // Default to joinedAt
      mongoSort = { joinedAt: direction };
      sortField = "joinedAt"; // unify naming
    }

    // 4) Build a match stage for the community
    const matchStage = {
      community_id: new mongoose.Types.ObjectId(communityId),
    };

    // 5) Count total membership documents (the total members)
    const totalCount = await UserCommunity.countDocuments(matchStage);

    // 6) Aggregate pipeline for sorting and pagination
    const members = await UserCommunity.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",            // the 'users' collection name
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },    // convert userData array to a single doc
      { $sort: mongoSort },        // sort by the chosen field(s)
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          "userData.password": 0,  // hide sensitive fields
          "userData.__v": 0,
          __v: 0,
        },
      },
    ]);

    // 7) Return results
    return res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalMembers: totalCount,       // <--- total membership size
      sortField,
      sortDirection,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all communities a user joined
// @route   GET /api/user-communities/user
// @access  Private
const getUserCommunities = async (req, res, next) => {
  try {
    const userCommunities = await UserCommunity.find({ user_id: req.user._id })
      .populate("community_id")
      .lean();

    res.status(200).json(userCommunities);
  } catch (error) {
    next(error);
  }
};

const getCommunitiesForUser = async (req, res, next) => {
  try {
    const memberships = await UserCommunity.find({
      user_id: req.params.userId,
    })
      .populate("community_id", "name description")
      .lean();

    res.status(200).json(memberships);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a user from a community by Admin
 * @route   DELETE /api/user-communities/:communityId/:userId
 * @access  Private (Admin Only)
 */
const removeUserFromCommunity = async (req, res, next) => {
  try {
    const { communityId, userId } = req.params;

    // Optionally check if the calling admin has the right to remove members, etc.

    // Find and delete membership
    const membership = await UserCommunity.findOneAndDelete({
      user_id: userId,
      community_id: communityId
    });

    if (!membership) {
      return res.status(404).json({ message: "User is not a member of this community." });
    }

    return res.status(200).json({ message: "User removed from community successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinCommunity,
  leaveCommunity,
  getUsersInCommunity,
  getUserCommunities,
  getCommunitiesForUser,
  removeUserFromCommunity
};
