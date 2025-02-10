const mongoose = require("mongoose");

const UserCommunitySchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    community_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Community", 
        required: true 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
);

UserCommunitySchema.index({ user_id: 1, community_id: 1 }, { unique: true });

const UserCommunity = mongoose.model("UserCommunity", UserCommunitySchema);
module.exports = UserCommunity;
