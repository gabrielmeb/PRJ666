const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true, // Ensures email is stored in lowercase.
      match: [/.+\@.+\..+/, "Invalid email format"],
      index: true, // Optimized for queries.
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Excludes password field by default in queries.
    },
    date_of_birth: {
      type: Date,
    },
    preferences: {
      type: [String],
      default: [],
    },
    profile_image: {
      type: String,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
  },
  { timestamps: true }
);

// Hash password before saving if it has been modified.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare candidate password with the stored hashed password.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Customize JSON output to remove sensitive fields.
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
