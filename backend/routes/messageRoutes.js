const express = require("express");
const {
  sendMessage,
  getMessagesInCommunity,
  getUserMessagesInCommunity,
  deleteMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes (User Auth Required)
router.post("/", protect, sendMessage); // Send Message
router.get("/community/:communityId", protect, getMessagesInCommunity); // Get Messages in Community
router.get("/community/:communityId/user/:userId", protect, getUserMessagesInCommunity); // Get User's Messages
router.delete("/:messageId", protect, deleteMessage); // Delete Message

module.exports = router;
