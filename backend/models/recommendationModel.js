const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true },
    type: { 
        type: String, 
        enum: ["Product", "Service", "Community"], 
        required: true },
    content: { 
        type: Object, 
        required: true },
    feedback: { 
        type: String },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
module.exports = Recommendation;
