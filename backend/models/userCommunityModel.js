const mongoose = require("mongoose");

const UserCommunitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Enforce unique user-community relationship to prevent duplicate entries.
UserCommunitySchema.index({ user_id: 1, community_id: 1 }, { unique: true });

// NOTE: Cascading deletion of user-community relationships (e.g., when a Community is removed)
// should be handled in the Community model's pre-remove hook rather than within the UserCommunity model.

const UserCommunity = mongoose.model("UserCommunity", UserCommunitySchema);
module.exports = UserCommunity;
