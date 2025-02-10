const Notification = require("../models/notificationModel");

// @desc    Send a notification (Admin Only)
// @route   POST /api/notifications
// @access  Private (Admin Only)
const sendNotification = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;

    if (!user_id || !message || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNotification = await Notification.create({ user_id, message, type });

    res.status(201).json({ message: "Notification sent successfully", notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id });

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found" });
    }

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure only the owner can mark as read
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this notification" });
    }

    notification.read = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure only the owner can delete notification
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this notification" });
    }

    await notification.remove();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
};
