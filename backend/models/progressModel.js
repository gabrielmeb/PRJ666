const mongoose = require("mongoose");

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Milestone title is required"],
    trim: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  date_achieved: {
    type: Date
  }
});

const ProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    goal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true
    },
    progress_percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    milestones: [MilestoneSchema],
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// 🔹 Ensure proper cleanup when progress entry is deleted
ProgressSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Goal").updateOne(
      { _id: this.goal_id },
      { $pull: { progress: this._id } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Progress = mongoose.model("Progress", ProgressSchema);
module.exports = Progress;
