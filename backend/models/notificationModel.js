const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["Reminder", "Recommendation", "Update"], 
        required: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
