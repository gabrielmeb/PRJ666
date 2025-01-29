const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    community_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Community", 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    attachments: [{ 
        type: String 
    }], // URLs for images, files, etc.
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
