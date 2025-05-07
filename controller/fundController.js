const FundRequest = require("../models/fundRequestModel");

// Add Fund Request
const addFundRequest = async (req, res) => {
  try {
    const {
      user_id,
      uuid,
      paymentMode,
      Amount,
      selectBank,
      refrenceNumber,
      depositDate,
      depositTime,
    } = req.body;

    const receiptImage = req.file
      ? {
          public_id: Date.now().toString(),
          // ✅ Fix path for URL usage
          url: req.file.path.replace(/\\/g, "/"),
        }
      : null;

    const newFundRequest = new FundRequest({
      user_id,
      uuid,
      paymentMode,
      Amount,
      selectBank,
      refrenceNumber,
      depositDate,
      depositTime,
      ReciptImg: receiptImage ? [receiptImage] : [],
    });

    await newFundRequest.save();

    res.status(201).json({
      success: true,
      message: "Fund request created",
      data: newFundRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error adding fund request" });
  }
};

// Update Fund Request
const updateFundRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };

    if (req.file) {
      updateData.ReciptImg = [
        {
          public_id: Date.now().toString(),
          url: req.file.path,
        },
      ];
    }

    const updated = await FundRequest.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Fund request not found" });

    res
      .status(200)
      .json({ success: true, message: "Fund request updated", data: updated });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating fund request" });
  }
};

const GetFundRequest = async (req, res) => {
  try {
    const { id } = req.body;

    const allFundData = await FundRequest.find({ user_id: id });

    res.status(200).json({
      success: true,
      message: "Fund requests fetched successfully",
      data: allFundData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching fund requests",
    });
  }
};

module.exports = { addFundRequest, updateFundRequest, GetFundRequest };
