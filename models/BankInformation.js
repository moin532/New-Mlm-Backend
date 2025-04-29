const mongoose = require("mongoose");

const BankInfo = new mongoose.Schema({
  AccountHolderName: String,
  AccountNumber: String,
  IFSC: String,
  BankName: String,
  BankBrnach: String,
  AccountType: String,
  userId: String,
});

module.exports = mongoose.model("MLM Bank", BankInfo);
