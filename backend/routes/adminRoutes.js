const express = require("express");
const { protectAdmin, authorizeAdmin } = require("../middleware/adminMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");
const { body } = require("express-validator");

const {
  getAllAdmins,
  getAdminById,
  registerAdmin,
  updateAdminProfile,
  updateAdminRole,
  deleteAdmin
} = require("../controllers/adminController");

const {
  getAllUsers,
  getUserById,
  searchUsers,
  getTotalUsers,
  getUsersJoinedLastWeek,
  getUsersJoinedLastMonth,
  deleteUser,
} = require("../controllers/userController");

const {
  createCommunity,
  getTotalCommunities,
  getTopCommunities,
  getCommunitiesCreatedLastWeek,
  getCommunitiesCreatedLastMonth,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  searchCommunities,
} = require("../controllers/communityController");

const {
  addContent,
  getTotalContentItems,
  getMostPopularCategories,
  getAllContent,
  getAllCategories,
  getContentByCategory,
  getRecentContent,
  searchContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentLibraryController");

const {
  getAllFeedback,
  getFeedbackByUserId,
  getAverageRating,
  getTopRatedUsers,
  getFeedbackStats,
} = require("../controllers/feedbackController");

const { 
  sendNotification 
} = require("../controllers/notificationController");

const router = express.Router();


/*************************
Admin Routes
*************************/
router.post("/register", protectAdmin, authorizeAdmin(["SuperAdmin"]), registerAdmin);
router.get("/admins", protectAdmin, authorizeAdmin(["SuperAdmin","Admin","Moderator"]), getAllAdmins);
router.get("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), getAdminById);
router.put("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), updateAdminRole);
router.put("/profile", protectAdmin, updateAdminProfile);
router.delete("/admins/:id", protectAdmin, authorizeAdmin(["SuperAdmin"]), deleteAdmin);

/*************************
 * User Routes
 *************************/
router.get("/users", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllUsers);
router.get("/users/search", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), searchUsers);
router.get("/users/total", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getTotalUsers);
router.get("/users/joined-last-week", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getUsersJoinedLastWeek);
router.get("/users/joined-last-month", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getUsersJoinedLastMonth);
router.delete("/users/:id", protectAdmin, authorizeAdmin(["SuperAdmin", "Admin"]), deleteUser);
router.get("/users/:id", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getUserById);

/*************************
 * Community Routes
 *************************/
router.get("/communities", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllCommunities);
router.get("/communities/search", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), searchCommunities);
router.get("/communities/total", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getTotalCommunities);
router.get("/communities/top", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getTopCommunities);
router.get("/communities/created-last-week", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getCommunitiesCreatedLastWeek);
router.get("/communities/created-last-month", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getCommunitiesCreatedLastMonth);
router.post("/communities", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), validateRequest([
  body("name").notEmpty().withMessage("Community name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
]), createCommunity);
router.put("/communities/:communityId", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), updateCommunity);
router.delete("/communities/:communityId", protectAdmin, authorizeAdmin(["SuperAdmin", "Admin"]), deleteCommunity);
router.get("/communities/:communityId", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getCommunityById);

/*************************
 * Content Library Routes
 *************************/
router.post("/content", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), addContent);
router.get("/content", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllContent);
router.get("/content/total", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getTotalContentItems);
router.get("/content/categories", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllCategories);
router.get("/content/popular-categories", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getMostPopularCategories);
router.get("/content/recent", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getRecentContent);
router.get("/content/search", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), searchContent);
router.get("/content/category/:category", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getContentByCategory);
router.put("/content/:contentId", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), updateContent);
router.delete("/content/:contentId", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin"]), deleteContent);

/*************************
 * Notifications Routes
 *************************/
router.post("/notifications", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), sendNotification);

/*************************
 * Feedback Routes
 *************************/
router.get("/feedback", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAllFeedback);
router.get("/feedback/user/:userId", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getFeedbackByUserId);
router.get("/feedback/average-rating", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getAverageRating);
router.get("/feedback/top-rated-users", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getTopRatedUsers);
router.get("/feedback/stats", protectAdmin, authorizeAdmin(["Admin", "SuperAdmin", "Moderator"]), getFeedbackStats);

module.exports = router;
