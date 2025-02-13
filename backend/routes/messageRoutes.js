const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  sendMessage,
  getMessagesInCommunity,
  getUserMessagesInCommunity,
  deleteMessage
} = require("../controllers/messageController");

const router = express.Router();

// Send a message in a community (Users only)
router.post("/", protect, upload.array("attachments", 5), sendMessage);

// Get all messages in a community (Users only)
router.get("/community/:communityId", protect, getMessagesInCommunity);

// Get messages from a specific user in a community (Users only)
router.get("/community/:communityId/user/:userId", protect, getUserMessagesInCommunity);

// Delete a message (Only the sender can delete)
router.delete("/:messageId", protect, deleteMessage);

module.exports = router;
