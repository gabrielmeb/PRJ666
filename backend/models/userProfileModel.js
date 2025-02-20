const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one profile per user
      index: true,
    },
    strengths: {
      type: [
        {
          category: { type: String, required: true },
          score: { type: Number, min: 1, max: 10, default: 5 }, // Allows user to rank strengths
        },
      ],
      default: [], // Ensures strengths defaults to an empty array
    },
    areas_for_growth: {
      type: [
        {
          category: { type: String, required: true },
          priority: { type: Number, min: 1, max: 5, default: 3 }, // Allows ranking of areas for growth
        },
      ],
      default: [], // Ensures areas_for_growth defaults to an empty array
    },
    goals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Goal",
      default: [], // Defaults to an empty array
    },
    progress: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Progress",
      default: [], // Defaults to an empty array
    },
  },
  { timestamps: true }
);

// 🔹 Cascade delete associated Goals and Progress when a UserProfile is removed.
// Note: This middleware only runs on .remove() and not on findOneAndRemove.
UserProfileSchema.pre("remove", async function (next) {
  try {
    // Updated filter criteria to match the profile's _id instead of user_id.
    await mongoose.model("Goal").deleteMany({ profile_id: this._id });
    await mongoose.model("Progress").deleteMany({ profile_id: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
module.exports = UserProfile;
