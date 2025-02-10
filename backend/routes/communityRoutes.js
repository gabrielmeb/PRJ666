const express = require("express");
const {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
} = require("../controllers/communityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createCommunity);
router.get("/", getAllCommunities);
router.get("/:communityId", getCommunityById);
router.put("/:communityId", protect, adminOnly, updateCommunity);
router.delete("/:communityId", protect, adminOnly, deleteCommunity);

module.exports = router;
