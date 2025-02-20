const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true, // Optimized for queries
    },
    description: {
      type: String,
      required: [true, "Goal description is required"],
      trim: true,
      minlength: [5, "Goal description must be at least 5 characters long"],
      maxlength: [200, "Goal description cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      required: true,
    },
    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
    },
  },
  { timestamps: true }
);

// 🔹 Cascade delete associated Progress records when a Goal is removed.
// Updated the query filter to use the correct field "goal" to match the Progress model.
GoalSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Progress").deleteMany({ goal: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
