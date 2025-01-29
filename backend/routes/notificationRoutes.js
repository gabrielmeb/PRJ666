const express = require("express");
const {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Routes
router.post("/", protect, adminOnly, sendNotification);
router.get("/", protect, getUserNotifications);
router.put("/:notificationId", protect, markNotificationAsRead);
router.delete("/:notificationId", protect, deleteNotification);

module.exports = router;
