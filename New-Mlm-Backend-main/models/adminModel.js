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
      select: false, // Do not return password hash by default
    },
    // Add other fields if needed, e.g., name, email
    name: {
        type: String,
        required: false
    }
  },
  { timestamps: true }
);

// Method to set (hash) password
adminSchema.methods.setPassword = async function (password) {
  if (!password || password.length < 6) { // Add basic password validation
      throw new Error("Password must be at least 6 characters long.");
  }
  this.passwordHash = await bcrypt.hash(password, 10);
};

// Method to compare password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Pre-save hook could also be used for hashing if preferred
// adminSchema.pre("save", async function (next) {
//   if (!this.isModified("passwordHash")) {
//     next();
//   }
//   // Re-hash if password field was directly set (not recommended, use setPassword)
//   // This assumes a temporary 'password' field was added to schema, which we are not doing here.
//   // const salt = await bcrypt.genSalt(10);
//   // this.passwordHash = await bcrypt.hash(this.password, salt);
// });

module.exports = mongoose.model("Admin", adminSchema);

