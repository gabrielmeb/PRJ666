const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender_id: {
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
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message must have at least 1 character"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    attachments: {
      type: [String],
      default: [], 
      validate: {
        validator: function (v) {
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
