const Message = require("../models/messageModel");
const Community = require("../models/communityModel");
const { validationResult } = require("express-validator");

// @desc    Send a message in a community
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { community_id, message, attachments } = req.body;
    const userId = req.user._id;

    // Create a new message
    const newMessage = await Message.create({
      sender_id: userId,
      community_id,
      message,
      attachments: attachments || []
    });

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages in a community with pagination
// @route   GET /api/messages/community/:communityId
// @access  Private
const getMessagesInCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ community_id: communityId })
      .populate("sender_id", "first_name last_name profile_image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ page, limit, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages from a specific user in a community
// @route   GET /api/messages/community/:communityId/user/:userId
// @access  Private
const getUserMessagesInCommunity = async (req, res, next) => {
  try {
    const { communityId, userId } = req.params;
    const messages = await Message.find({ community_id: communityId, sender_id: userId })
      .populate("sender_id", "first_name last_name profile_image")
      .sort({ createdAt: -1 })
      .lean();

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found for this user in this community" });
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Allow only the sender or an admin to delete the message
    if (message.sender_id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized to delete this message" });
    }

    await message.remove();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessagesInCommunity,
  getUserMessagesInCommunity,
  deleteMessage
};
