const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { protectAdmin } = require("../middleware/adminMiddleware");

const {
  joinCommunity,
  leaveCommunity,
  getUsersInCommunity,
  getUserCommunities,
  getCommunitiesForUser,
  removeUserFromCommunity
} = require("../controllers/userCommunityController");

const router = express.Router();

// Join a community (Users only)
router.post("/", protect, joinCommunity);

// Leave a community (Users only)
router.delete("/:communityId", protect, leaveCommunity);

// Get all users in a community (Admins & Members)
router.get("/community/:communityId", getUsersInCommunity);

router.get("/user/:userId", protectAdmin, getCommunitiesForUser);

// Get all communities a user has joined (Users)
router.get("/user", protect, getUserCommunities);

// DELETE /api/user-communities/:communityId/:userId => remove user
router.delete("/:communityId/:userId", protectAdmin, removeUserFromCommunity);

module.exports = router;
