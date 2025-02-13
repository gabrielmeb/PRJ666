const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Community name must be at least 3 characters"],
      maxlength: [100, "Community name cannot exceed 100 characters"],
      index: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"]
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
      }
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// 🔹 Ensure cleanup of related messages when a community is deleted
CommunitySchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Message").deleteMany({ community_id: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const Community = mongoose.model("Community", CommunitySchema);
module.exports = Community;
