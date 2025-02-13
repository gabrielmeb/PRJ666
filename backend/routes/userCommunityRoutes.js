const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  joinCommunity,
  leaveCommunity,
  getUsersInCommunity,
  getUserCommunities
} = require("../controllers/userCommunityController");

const router = express.Router();

// Join a community (Users only)
router.post("/", protect, joinCommunity);

// Leave a community (Users only)
router.delete("/:communityId", protect, leaveCommunity);

// Get all users in a community (Admins & Members)
router.get("/community/:communityId", protect, getUsersInCommunity);

// Get all communities a user has joined (Users)
router.get("/user", protect, getUserCommunities);

module.exports = router;
