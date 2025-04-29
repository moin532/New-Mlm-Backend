// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sponsorId: { type: String, required: false },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    nomineeName: { type: String, required: false },
    panCard: { type: String, required: true, unique: true },
    aadhaarCard: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    nomineeName: { type: String, required: false },
    nomineRelation: { type: String, required: false },
    nominePanCard: { type: String, required: false },
    nomineAadharCard: { type: String, required: false },
    Address: { type: String, required: false },
    State: { type: String, required: false },
    Pincode: { type: String, required: false },
    gender: { type: String, enum: ["Male", "Female"] },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

module.exports = mongoose.model("UserMLmLipo", userSchema);
