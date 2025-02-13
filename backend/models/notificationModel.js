const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // Optimized for user-based queries
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      minlength: [5, "Notification message must have at least 5 characters"],
      maxlength: [500, "Notification message cannot exceed 500 characters"]
    },
    type: {
      type: String,
      enum: ["Reminder", "Recommendation", "Update"],
      required: [true, "Notification type is required"]
    },
    read: {
      type: Boolean,
      default: false,
      index: true // Optimized for querying unread notifications
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
