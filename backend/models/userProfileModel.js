const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    strengths: [{ 
        type: String 
    }],
    areas_for_growth: [{ 
        type: String 
    }],
    goals: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Goal" 
    }],
    progress: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Progress" 
    }],
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
module.exports = UserProfile;
