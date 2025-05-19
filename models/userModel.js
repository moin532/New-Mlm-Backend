// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sponsorId: { type: String, required: false },
    UUID: { type: String },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    nomineeName: { type: String, required: false },
    panCard: { type: String, required: true, unique: true },
    aadhaarCard: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    nomineRelation: { type: String, required: false },
    Address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: String, required: false },
    gender: { type: String, required: false },
    dateOfBirth: { type: String, required: false },
    rank: { type: String, default: "free" },

    active: { type: String, default: "false" },
    ActiveDate: { type: String }, // or Date if you prefer
    kycVerified: { type: String, default: "Not Verified" },
    block: { type: String, default: "No" },

    ProfileImg: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    role: {
      type: String,
      default: "user",
    },

    referrals: [
      {
        type: String, // UUID instead of ObjectId
        ref: "UserMLmLipo",
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

module.exports = mongoose.model("UserMLmLipo", userSchema);
