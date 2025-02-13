const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true, 
      minlength: [3, "Name must be at least 3 characters long"], 
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      lowercase: true, 
      unique: true, 
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"], // Email validation
      index: true // Optimized for searches
    },
    password: { 
      type: String, 
      required: [true, "Password is required"], 
      minlength: [6, "Password must be at least 6 characters"], 
      select: false // Excludes password field by default in queries
    },
    role: {
      type: String, 
      enum: ["SuperAdmin", "Admin", "Moderator"], 
      default: "Moderator",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    }
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔹 Compare Password Method
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🔹 Hide Password in JSON Output
AdminSchema.methods.toJSON = function () {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
