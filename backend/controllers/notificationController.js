const Notification = require("../models/notificationModel");
const { validationResult } = require("express-validator");

// @desc    Send notifications (Admin Only, supports bulk sending)
// @route   POST /api/notifications
// @access  Private (Admin Only)
const sendNotification = async (req, res, next) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_ids, message, type } = req.body;

    // Check if admin is sending notifications
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Unauthorized to send notifications" });
    }

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "Valid user IDs are required" });
    }

    const notifications = user_ids.map((userId) => ({
      user_id: userId,
      message,
      type
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({ message: "Notifications sent successfully", notifications: createdNotifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications with pagination
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found" });
    }

    res.status(200).json({ page, limit, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notificationId
// @access  Private
const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure only the recipient can mark as read
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this notification" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all
// @access  Private
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user_id: req.user._id, read: false }, { $set: { read: true } });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure only the recipient can delete the notification
    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this notification" });
    }

    await notification.remove();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all notifications for a user
// @route   DELETE /api/notifications/delete-all
// @access  Private
const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user_id: req.user._id });

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
};
