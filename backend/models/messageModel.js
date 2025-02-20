const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized for querying messages by sender
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true, // Optimized for querying messages by community
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message must have at least 1 character"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    attachments: {
      type: [String],
      default: [], // Initialize as an empty array if no attachments are provided.
      validate: {
        validator: function (v) {
          // Allow an empty array or validate each URL in the array.
          return v.every(url => /^(http|https):\/\/[^ "]+$/.test(url));
        },
        message: props => `${props.value} contains an invalid URL!`,
      },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
