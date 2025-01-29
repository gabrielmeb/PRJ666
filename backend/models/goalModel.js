const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Pending", "In Progress", "Completed"], 
        default: "Pending" 
    },
    progress: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Progress" 
    }],
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
