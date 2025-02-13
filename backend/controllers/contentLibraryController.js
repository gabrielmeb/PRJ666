const ContentLibrary = require("../models/contentLibraryModel");
const { validationResult } = require("express-validator");

// @desc    Add new content to the library
// @route   POST /api/content
// @access  Private (Admin Only)
const addContent = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, url } = req.body;

    // Optional: Prevent duplicate content titles
    const existingContent = await ContentLibrary.findOne({ title });
    if (existingContent) {
      return res.status(400).json({ message: "Content with this title already exists" });
    }

    const newContent = await ContentLibrary.create({ title, description, category, url });

    res.status(201).json({ message: "Content added successfully", content: newContent });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all content with pagination
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const content = await ContentLibrary.find()
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: content.length, content });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content by category with pagination
// @route   GET /api/content/category/:category
// @access  Public
const getContentByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const content = await ContentLibrary.find({ category })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!content.length) {
      return res.status(404).json({ message: "No content found for this category" });
    }

    res.status(200).json({ page, limit, count: content.length, content });
  } catch (error) {
    next(error);
  }
};

// @desc    Update content details
// @route   PUT /api/content/:contentId
// @access  Private (Admin Only)
const updateContent = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, url } = req.body;
    const content = await ContentLibrary.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    content.title = title || content.title;
    content.description = description || content.description;
    content.category = category || content.category;
    content.url = url || content.url;

    await content.save();
    res.status(200).json({ message: "Content updated successfully", content });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:contentId
// @access  Private (Admin Only)
const deleteContent = async (req, res, next) => {
  try {
    const content = await ContentLibrary.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    await content.remove();
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addContent,
  getAllContent,
  getContentByCategory,
  updateContent,
  deleteContent
};
