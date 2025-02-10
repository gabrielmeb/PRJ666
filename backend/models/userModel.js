const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    date_of_birth: { 
        type: Date, 
    },
    preferences: { 
        type: [String], 
        default: [] 
    },
    profile_image: { 
        type: String, 
        default: "https://api.dicebear.com/7.x/initials/svg?seed=User" // Default avatar
    },
    profile: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserProfile" 
    },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  const User = mongoose.model("User", UserSchema);
  module.exports = User;