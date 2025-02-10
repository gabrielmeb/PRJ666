const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        lowercase: true,
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String, 
        enum: ["Super Admin", "Admin", "Moderator"], 
        default: 'moderator',
        required: true 
    },
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  // Convert email to lowercase if changed
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  // If password isn’t changed, don’t re-hash
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
