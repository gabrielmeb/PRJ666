const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  createCommunity,
  getAllCommunities,
  searchCommunities,   // <-- Import searchCommunities controller
  getCommunityById,
  updateCommunity,
  deleteCommunity
} = require("../controllers/communityController");

const router = express.Router();

// Create a new community (Users & Admins)
router.post(
  "/",
  protect,
  validateRequest([
    body("name").notEmpty().withMessage("Community name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("tags").optional().isArray().withMessage("Tags must be an array")
  ]),
  createCommunity
);

// **** Add Search Route BEFORE Dynamic Route ****
router.get("/search", searchCommunities);

// Get all communities (Public) with pagination support in query string e.g., ?page=1&limit=10
router.get("/", getAllCommunities);

// Get a specific community by ID (Public)
router.get("/:communityId", getCommunityById);

// Update a community (Admin & Community Creator)
router.put(
  "/:communityId",
  protect,
  authorize("Admin", "SuperAdmin"),
  validateRequest([
    body("name").optional().notEmpty().withMessage("Community name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("tags").optional().isArray().withMessage("Tags must be an array")
  ]),
  updateCommunity
);

// Delete a community (Only Admins & SuperAdmins)
router.delete("/:communityId", protect, authorize("SuperAdmin"), deleteCommunity);

module.exports = router;
