const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,

      required: true,
    },
    panCardImage: { type: String },
    aadhaarCardFrontImage: { type: String },
    aadhaarCardBackImage: { type: String },
    bankDocumentImage: { type: String }, // Cancel Cheque or Passbook

    nominee: {
      name: { type: String },
      relation: { type: String },
      panCardNumber: { type: String },
      aadhaarCardNumber: { type: String },
      panCardImage: { type: String },
      aadhaarCardFrontImage: { type: String },
      aadhaarCardBackImage: { type: String },
      bankDocumentImage: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LllmProfile", profileSchema);
