const mongoose = require("mongoose");
const User = require("../models/userModel");
const UserProfile = require("../models/userProfileModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");


// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, date_of_birth, preferences } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const defaultAvatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(first_name + " " + last_name)}`;

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password, // Password is auto-hashed in UserModel.js
      date_of_birth,
      preferences,
      profile_image: defaultAvatar
    });

    // Ensure profile is created
    const newUserProfile = await UserProfile.create({
      user_id: newUser._id,
      strengths: [],
      areas_for_growth: [],
      goals: [],
      progress: []
    });

    newUser.profile = newUserProfile._id;
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        profile_id: newUserProfile._id,
        profile_image: newUser.profile_image
      },
      token: generateToken(newUser)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_image: user.profile_image,
        profile_id: user.profile
      },
      token: generateToken(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total number of users
// @route   GET /api/users/total
// @access  Private (Admin Only)
const getTotalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    // Parse pagination query parameters (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get the total count for metadata
    const totalCount = await User.countDocuments();
    
    // Fetch only the required page of users
    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      users,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // 🔥 Fix: Validate ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select("-password").populate("profile").lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by name (first_name, last_name, or full name in any order)
// @route   GET /api/users/search?q=searchTerm
// @access  Private (Admins & Users)
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    let queryConditions = [];
    const regex = new RegExp(q, "i");

    if (mongoose.Types.ObjectId.isValid(q) && q.length === 24) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(q) });
    }

    queryConditions.push(
      { first_name: { $regex: regex } },
      { last_name: { $regex: regex } },
      { email: { $regex: regex } },
      { $expr: { $regexMatch: { input: { $concat: ["$first_name", " ", "$last_name"] }, regex } } }
    );

    if (queryConditions.length === 0) {
      return res.status(400).json({ message: "Invalid search query." });
    }

    const users = await User.find({ $or: queryConditions }).select("-password");

    res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : null,
    });
  }
};

// @desc    Get number of users joined in the last week
// @route   GET /api/users/weekly-registrations
// @access  Private (Admin Only)
const getUsersJoinedLastWeek = async (req, res, next) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const count = await User.countDocuments({ createdAt: { $gte: lastWeek } });

    res.status(200).json({ usersJoinedLastWeek: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get number of users joined in the last month
// @route   GET /api/users/monthly-registrations
// @access  Private (Admin Only)
const getUsersJoinedLastMonth = async (req, res, next) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const count = await User.countDocuments({ createdAt: { $gte: lastMonth } });

    res.status(200).json({ usersJoinedLastMonth: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, date_of_birth, preferences } = req.body;

    if (typeof preferences === "string") {
      preferences = JSON.parse(preferences);
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔹 Update text fields if provided
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.date_of_birth = date_of_birth || user.date_of_birth;
    user.preferences = preferences || user.preferences;

    // 🔹 If an image is uploaded, update Cloudinary URL
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "profile_images" });
      user.profile_image = result.secure_url; // Store new Cloudinary URL
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
};



// @desc    Delete user and related data
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    // First, delete the user profile if it exists
    await UserProfile.findOneAndDelete({ user_id: req.params.id });

    // Then delete the user using findByIdAndDelete
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({ message: "User Removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Ops! Server error. We are working to fix it.", error: error.message });
  }
};

// Export controllers
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  searchUsers,
  getTotalUsers,
  getUsersJoinedLastWeek,
  getUsersJoinedLastMonth,
  updateUser,
  deleteUser
};
