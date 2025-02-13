const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 🔹 Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_images", // Folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed file types
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

// 🔹 Multer File Upload Handler
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

module.exports = upload;
