const mongoose = require("mongoose");

const ContentLibrarySchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ["Fitness", "Finance", "Productivity", "Mental Health"], 
        required: true 
    },
    url: { 
        type: String, 
        required: true 
    },
  },
  { timestamps: true }
);

const ContentLibrary = mongoose.model("ContentLibrary", ContentLibrarySchema);
module.exports = ContentLibrary;
