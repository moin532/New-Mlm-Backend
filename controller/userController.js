const User = require("../models/userModel");
const BankInfo = require("../models/BankInformation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.LoginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    console.log(req.body);

    const user = await User.findOne({ mobile: phone }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user?.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        content: "Incorrect credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, sponsorId: user.sponsorId },
      process.env.JWT_SECRET || "bigweltInfotechPvt", // Replace hardcoded key in production
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.Register = async (req, res) => {
  try {
    const {
      name,
      sponsorId,
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      password,
    } = req.body;

    console.log(req.body);
    // Check if user already exists (removed space in "mobile")
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      sponsorId,
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      passwordHash,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, sponsorId: user.sponsorId },
      process.env.JWT_SECRET || "bigweltInfotechPvt", // Use env in production
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.LoadUser = async (req, res) => {
  try {
    const id = req.params.id;
    const usere = await User.findById(id);

    res.status(200).json({
      usere,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      err: error.message,
    });
  }
};

exports.AddBankInfo = async (req, res) => {
  try {
    const {
      AccountHolderName,
      AccountNumber,
      IFSC,
      BankName,
      BankBrnach,
      AccountType,
      userId,
    } = req.body;

    const user = new BankInfo({
      AccountHolderName,
      AccountNumber,
      IFSC,
      BankName,
      BankBrnach,
      AccountType,
      userId,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Bank Info Added successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
