const Message = require("../models/messageModel");
const Community = require("../models/communityModel");

// @desc    Send a message in a community
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { community_id, message, attachments } = req.body;
    const userId = req.user._id;

    // Validate community
    const community = await Community.findById(community_id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Create a new message
    const newMessage = await Message.create({
      sender_id: userId,
      community_id,
      message,
      attachments,
    });

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all messages in a community
// @route   GET /api/messages/community/:communityId
// @access  Private
const getMessagesInCommunity = async (req, res) => {
  try {
    const messages = await Message.find({ community_id: req.params.communityId })
      .populate("sender_id", "first_name last_name profile_image")
      .sort({ createdAt: -1 });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found in this community" });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get messages from a specific user in a community
// @route   GET /api/messages/community/:communityId/user/:userId
// @access  Private
const getUserMessagesInCommunity = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const messages = await Message.find({ community_id: communityId, sender_id: userId })
      .populate("sender_id", "first_name last_name profile_image")
      .sort({ createdAt: -1 });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found for this user in this community" });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Allow only the sender to delete their message
    if (message.sender_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this message" });
    }

    await message.remove();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesInCommunity,
  getUserMessagesInCommunity,
  deleteMessage,
};
