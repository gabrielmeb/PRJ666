const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized for query performance by user
    },
    content: {
      type: String,
      required: [true, "Feedback content is required"],
      trim: true,
      minlength: [10, "Feedback content must be at least 10 characters long"],
      maxlength: [1000, "Feedback content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Optional: Prevent duplicate feedback submissions from the same user by uncommenting the following index
// FeedbackSchema.index({ user_id: 1 }, { unique: true });

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
