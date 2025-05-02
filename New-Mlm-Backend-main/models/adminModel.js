const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, 
    },
    name: {
        type: String,
        required: false
    }
  },
  { timestamps: true }
);

// Method to set (hash) password
adminSchema.methods.setPassword = async function (password) {
  if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
  }
  this.passwordHash = await bcrypt.hash(password, 10);
};

// Method to compare password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};



module.exports = mongoose.model("Admin", adminSchema);

