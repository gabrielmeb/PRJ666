const ContentLibrary = require("../models/contentModel");

// @desc    Add new content to the library
// @route   POST /api/content
// @access  Private (Admin Only)
const addContent = async (req, res) => {
  try {
    const { title, category, url } = req.body;

    // Validate required fields
    if (!title || !category || !url) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContent = await ContentLibrary.create({ title, category, url });

    res.status(201).json({ message: "Content added successfully", content: newContent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all content
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res) => {
  try {
    const content = await ContentLibrary.find();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get content by category
// @route   GET /api/content/category/:category
// @access  Public
const getContentByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const content = await ContentLibrary.find({ category });

    if (!content.length) {
      return res.status(404).json({ message: "No content found for this category" });
    }

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update content
// @route   PUT /api/content/:contentId
// @access  Private (Admin Only)
const updateContent = async (req, res) => {
  try {
    const { title, category, url } = req.body;
    const content = await ContentLibrary.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    content.title = title || content.title;
    content.category = category || content.category;
    content.url = url || content.url;

    await content.save();
    res.status(200).json({ message: "Content updated successfully", content });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:contentId
// @access  Private (Admin Only)
const deleteContent = async (req, res) => {
  try {
    const content = await ContentLibrary.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    await content.remove();
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addContent,
  getAllContent,
  getContentByCategory,
  updateContent,
  deleteContent,
};
