const mongoose = require("mongoose");

const FundRequestModel = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
  paymentMode: {
    type: String,
  },
  Amount: {
    type: String,
  },
  message: {
    type: String,
  },
  selectBank: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  refrenceNumber: {
    type: String,
  },
  depositDate: {
    type: String,
  },
  depositTime: {
    type: String,
  },
  ReciptImg: [
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
});

module.exports = mongoose.model("FundRequest", FundRequestModel);
