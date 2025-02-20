const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized for user queries
    },
    type: {
      type: String,
      enum: ["Product", "Service", "Community"],
      required: [true, "Recommendation type is required"],
    },
    content: {
      title: {
        type: String,
        required: [true, "Recommendation title is required"],
        trim: true,
      },
      description: {
        type: String,
        required: [true, "Recommendation description is required"],
        trim: true,
      },
      link: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            if (!v) return true; // Allow empty values if link is not provided.
            return /^(http|https):\/\/[^ "]+$/.test(v);
          },
          message: props => `${props.value} is not a valid URL!`,
        },
      },
    },
    feedback: {
      type: String,
      trim: true,
      default: "", // Default feedback as an empty string
    },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
module.exports = Recommendation;
