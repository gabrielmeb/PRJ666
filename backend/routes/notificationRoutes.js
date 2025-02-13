const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} = require("../controllers/notificationController");

const router = express.Router();

// Send a notification (Admin & SuperAdmin only)
router.post("/", protect, authorize("Admin", "SuperAdmin"), sendNotification);

// Get all notifications for a user (User only)
router.get("/", protect, getUserNotifications);

// Mark a single notification as read (User only)
router.put("/:notificationId", protect, markNotificationAsRead);

// Mark all notifications as read (User only)
router.put("/mark-all", protect, markAllNotificationsAsRead);

// Delete a single notification (User only)
router.delete("/:notificationId", protect, deleteNotification);

// Delete all notifications (User only)
router.delete("/delete-all", protect, deleteAllNotifications);

module.exports = router;
