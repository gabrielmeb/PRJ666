const User = require("../models/userModel");
const UserProfile = require("../models/userProfileModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("profile").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete user profile
    await UserProfile.findOneAndDelete({ user_id: user._id });

    // Delete user
    await user.remove();
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controllers
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
