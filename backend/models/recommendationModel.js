const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // Optimized for user queries
    },
    type: {
      type: String,
      enum: ["Product", "Service", "Community"],
      required: [true, "Recommendation type is required"]
    },
    content: {
      title: {
        type: String,
        required: [true, "Recommendation title is required"],
        trim: true
      },
      description: {
        type: String,
        required: [true, "Recommendation description is required"],
        trim: true
      },
      link: {
        type: String,
        validate: {
          validator: function (v) {
            return /^(http|https):\/\/[^ "]+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid URL!`
        }
      }
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
module.exports = Recommendation;
