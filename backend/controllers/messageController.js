const Message = require("../models/messageModel");
const Community = require("../models/communityModel");
const { validationResult } = require("express-validator");

// @desc    Send a message in a community
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { community_id, message, attachments } = req.body;
    const sender_id = req.user._id;

    // 1) Create message
    const newMsg = await Message.create({ sender_id, community_id, message, attachments });

    // 2) Push to Community.messages
    await Community.findByIdAndUpdate(community_id, {
      $push: { messages: newMsg._id }
    });

    // 3) Populate for response & real‑time
    const populated = await Message.findById(newMsg._id).populate(
      "sender_id",
      "first_name last_name profile_image"
    );

    // 4) Emit to Socket.io room
    const io = req.app.get("io");
    io.to(community_id.toString()).emit("newMessage", populated);

    res.status(201).json({ message: "Message sent", newMessage: populated });
  } catch (err) {
    next(err);
  }
};

const getMessagesInCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ community_id: communityId })
      .populate("sender_id", "first_name last_name profile_image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ page, limit, count: messages.length, messages });
  } catch (err) {
    next(err);
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
