const mongoose = require("mongoose");

const UserCommunitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// 🔹 Enforce unique user-community relationship
UserCommunitySchema.index({ user_id: 1, community_id: 1 }, { unique: true });

// 🔹 Ensure cleanup of user-community relationships when a community is deleted
UserCommunitySchema.pre("remove", async function (next) {
  try {
    await mongoose.model("UserCommunity").deleteMany({ community_id: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const UserCommunity = mongoose.model("UserCommunity", UserCommunitySchema);
module.exports = UserCommunity;
