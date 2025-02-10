const express = require("express");
const {
  joinCommunity,
  leaveCommunity,
  getUsersInCommunity,
  getUserCommunities,
} = require("../controllers/userCommunityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, joinCommunity);
router.delete("/:communityId", protect, leaveCommunity);
router.get("/community/:communityId", protect, getUsersInCommunity);
router.get("/user", protect, getUserCommunities);

module.exports = router;
