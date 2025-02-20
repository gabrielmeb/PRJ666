const mongoose = require("mongoose");

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Milestone title is required"],
    trim: true,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
  date_achieved: {
    type: Date,
  },
});

const ProgressSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },
    goal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    progress_percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// 🔹 Cleanup reference in Goal when a Progress entry is removed.
// Since the Goal model stores a single reference (not an array) for progress,
// we update the goal's progress field to null if it matches the removed progress.
ProgressSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Goal").updateOne(
      { _id: this.goal_id, progress: this._id },
      { $set: { progress: null } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Progress = mongoose.model("Progress", ProgressSchema);
module.exports = Progress;
