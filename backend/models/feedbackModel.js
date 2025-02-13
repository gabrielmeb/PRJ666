const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // Improves query performance
    },
    content: {
      type: String,
      required: [true, "Feedback content is required"],
      trim: true,
      minlength: [10, "Feedback content must be at least 10 characters long"],
      maxlength: [1000, "Feedback content cannot exceed 1000 characters"]
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  { timestamps: true }
);

// 🔹 Optional: Prevent users from submitting duplicate feedback
// FeedbackSchema.index({ user_id: 1 }, { unique: true });

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
