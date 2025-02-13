const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const verifyCloudinary = async () => {
  try {
    const response = await cloudinary.api.ping();
    console.log("✅ Cloudinary is connected successfully!", response);
  } catch (error) {
    console.error("❌ Cloudinary Initialization Failed:", error.message);
  }
};

verifyCloudinary(); // Test Cloudinary connection

module.exports = cloudinary;
