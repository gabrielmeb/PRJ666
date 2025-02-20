const mongoose = require("mongoose");

const ContentLibrarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: ["Fitness", "Finance", "Productivity", "Mental Health"],
      required: [true, "Category is required"],
      index: true, // Optimized for category searches.
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`,
      },
    },
  },
  { timestamps: true }
);

const ContentLibrary = mongoose.model("ContentLibrary", ContentLibrarySchema);
module.exports = ContentLibrary;
