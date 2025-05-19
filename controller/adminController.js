const User = require("../models/userModel");
const Profile = require("../models/myProfileInfo");
const BankInfo = require("../models/BankInformation");
const FundRequest = require("../models/fundRequestModel");
exports.AdminSingleUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: id });
    const fundRequests = await FundRequest.find({ userId: id });
    const bankInfo = await BankInfo.findOne({ userId: id });

    res.status(200).json({
      success: true,
      user,
      profile,
      fundRequests,
      bankInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.UpdateUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, kycStatus } = req.body;

    if (!status || !["Active", "Not Active"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        active: status === "Active" ? "true" : "false",
        ActiveDate: status === "Active" ? new Date().toISOString() : null,
        kycVerified: kycStatus,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "KYC status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating KYC status",
      error: error.message,
    });
  }
};
