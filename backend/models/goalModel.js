const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // Optimized for queries
    },
    description: {
      type: String,
      required: [true, "Goal description is required"],
      trim: true,
      minlength: [5, "Goal description must be at least 5 characters long"],
      maxlength: [200, "Goal description cannot exceed 200 characters"]
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      required: true
    },
    progress: [
      {
        milestone: { type: String, required: true },
        achieved: { type: Boolean, default: false },
        progress_percentage: { type: Number, min: 0, max: 100, default: 0 },
        date_achieved: { type: Date }
      }
    ]
  },
  { timestamps: true }
);

// 🔹 Ensure progress entries are deleted when a goal is removed
GoalSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Progress").deleteMany({ goal_id: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
