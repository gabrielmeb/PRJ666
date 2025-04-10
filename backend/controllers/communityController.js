const Community = require("../models/communityModel");
const UserCommunity = require("../models/userCommunityModel");
const { validationResult } = require("express-validator");

/**
 * @desc    Create a new community
 * @route   POST /api/communities
 * @access  Private (Admin Only)
 */
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

    res
      .status(201)
      .json({ message: "Community created successfully", community: newCommunity });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total number of communities
// @route   GET /api/communities/total
// @access  Private (Admin Only)
const getTotalCommunities = async (req, res, next) => {
  try {
    const totalCommunities = await Community.countDocuments();
    res.status(200).json({ totalCommunities });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all communities with pagination
 * @route   GET /api/communities?page=1&limit=10
 * @access  Public (or Private, depending on your needs)
 */
const getAllCommunities = async (req, res, next) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count (for pagination metadata)
    const totalCount = await Community.countDocuments();

    // Fetch the requested page of communities
    const communities = await Community.find()
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.status(200).json({
      page,
      limit,
      totalPages,
      totalCount,
      communities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single community by ID
 * @route   GET /api/communities/:communityId
 * @access  Public (or Private, your choice)
 */
const getCommunityById = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.communityId).lean();
    // if (!community) {
    //   return res.status(404).json({ message: "Community not found" });
    // }
    res.status(200).json(community);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 5 communities with the most users
// @route   GET /api/communities/top
// @access  Private (Admin Only)
const getTopCommunities = async (req, res, next) => {
  try {
    const topCommunities = await UserCommunity.aggregate([
      {
        $group: {
          _id: "$community_id",
          memberCount: { $sum: 1 }
        }
      },
      { $sort: { memberCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "communities",
          localField: "_id",
          foreignField: "_id",
          as: "community"
        }
      },
      { $unwind: "$community" },
      {
        $project: {
          _id: "$community._id",
          name: "$community.name",
          description: "$community.description",
          memberCount: 1
        }
      }
    ]);

    res.status(200).json({ topCommunities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get number of communities created in the last week
// @route   GET /api/communities/weekly-registrations
// @access  Private (Admin Only)
const getCommunitiesCreatedLastWeek = async (req, res, next) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const count = await Community.countDocuments({ createdAt: { $gte: lastWeek } });

    res.status(200).json({ communitiesCreatedLastWeek: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get number of communities created in the last month
// @route   GET /api/communities/monthly-registrations
// @access  Private (Admin Only)
const getCommunitiesCreatedLastMonth = async (req, res, next) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const count = await Community.countDocuments({ createdAt: { $gte: lastMonth } });

    res.status(200).json({ communitiesCreatedLastMonth: count });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update community details
 * @route   PUT /api/communities/:communityId
 * @access  Private (Admin Only)
 */
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

/**
 * @desc    Delete a community
 * @route   DELETE /api/communities/:communityId
 * @access  Private (Admin Only)
 */
const deleteCommunity = async (req, res, next) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search communities by name, description, or tags
 * @route   GET /api/communities/search?q=searchTerm[&page=1&limit=10]
 * @access  Public (or Private)
 */
const searchCommunities = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query (q) is required" });
    }

    // Prepare case-insensitive regex
    const regex = new RegExp(q, "i");

    // Build our query; searching multiple fields:
    // name, description, or tags array
    const query = {
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $regex: regex } },
      ],
    };

    // For pagination in search
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // Get total count matching the search
    const totalCount = await Community.countDocuments(query);

    // Fetch the requested page of results
    const communities = await Community.find(query)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.status(200).json({
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      totalCount,
      communities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCommunity,
  getTotalCommunities,
  getTopCommunities,
  getCommunitiesCreatedLastWeek,
  getCommunitiesCreatedLastMonth,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  searchCommunities,
};
