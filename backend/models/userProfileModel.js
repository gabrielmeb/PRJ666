const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one profile per user
      index: true
    },
    strengths: [
      {
        category: { type: String, required: true },
        score: { type: Number, min: 1, max: 10, default: 5 } // Allows user to rank strengths
      }
    ],
    areas_for_growth: [
      {
        category: { type: String, required: true },
        priority: { type: Number, min: 1, max: 5, default: 3 } // Allows ranking of areas for growth
      }
    ],
    goals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
      }
    ],
    progress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Progress"
      }
    ]
  },
  { timestamps: true }
);

// 🔹 Ensure profile deletion when a user is deleted
UserProfileSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Goal").deleteMany({ user_id: this.user_id });
    await mongoose.model("Progress").deleteMany({ user_id: this.user_id });
    next();
  } catch (error) {
    next(error);
  }
});

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
module.exports = UserProfile;
