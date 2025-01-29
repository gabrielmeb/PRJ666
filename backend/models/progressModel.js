const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    goal_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Goal", required: true 
    },
    progress_percentage: { 
        type: Number, 
        min: 0, 
        max: 100, 
        required: true 
    },
    milestones: [{ 
      title: String, 
      achieved: { 
        type: Boolean, default: false 
      },
      date_achieved: { 
        type: Date 
    }
    }],
    notes: { 
        type: String 
    }, // Optional remarks
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", ProgressSchema);
module.exports = Progress;
