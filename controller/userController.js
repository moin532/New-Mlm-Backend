const User = require("../models/userModel");
const BankInfo = require("../models/BankInformation");
const bcrypt = require("bcrypt");
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
      { id: user._id, sponsorId: user.sponsorId, role: user.role },
      process.env.JWT_SECRET || "bigweltInfotechPvt", // Replace hardcoded key in production
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
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
      sponsorId, // this is the _id of the user who referred
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      password,
      role,
    } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with referId assigned
    const user = new User({
      name,
      referId: sponsorId, // ✅ correct field
      sponsorId: sponsorId, // optional, keep only if used separately
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      passwordHash,
      role: userRole,
    });

    await user.save();

    // Add this user to sponsor's referrals list
    if (sponsorId) {
      const sponsor = await User.findById(sponsorId);
      if (sponsor) {
        sponsor.referrals.push(user._id);
        await sponsor.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, referId: user.referId },
      process.env.JWT_SECRET || "bigweltInfotechPvt",
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
        referId: user.referId,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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

exports.changePassword = async (req, res) => {
  const userId = req.user.id; // Assumes req.user is set by auth middleware
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Check all fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    // Find user
    const user = (await User.findById(userId)).select("+passwordHash");

    if (!user) return res.status(404).json({ message: "User not found." });

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user?.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.UpdateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle password update
    if (req.body.password) {
      await user.setPassword(req.body.password);
    }

    // List of allowed fields to update
    const allowedUpdates = [
      "name",
      "sponsorId",
      "mobile",
      "email",
      "address",
      "nomineeName",
      "panCard",
      "aadhaarCard",
      "nomineRelation",
      "Address",
      "State",
      "Pincode",
      "gender",
    ];

    // Update allowed fields
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
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
      BankBranch,
      AccountType,
      userId,
    } = req.body;

    console.log(req.body);

    const user = new BankInfo({
      AccountHolderName,
      AccountNumber,
      IFSC,
      BankName,
      BankBranch,
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

exports.GetBankInfo = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log(userId);
    const userBankInfo = await BankInfo.find({ userId: userId }); // ✅ rename this
    if (!userBankInfo) {
      return res.status(404).json({
        success: false,
        message: "Bank Info not found",
      });
    }

    res.status(200).json({
      success: true,
      bankInfo: userBankInfo,
    });
  } catch (error) {
    console.error("GetBankInfo error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Treeeee
// exports.getGoDownline = async (req, res) => {
//   try {
//     const userId = req.params.id || req.user.id; // If using auth middleware

//     // Find the user and populate only direct referrals (G0)
//     const user = await User.findById(userId).populate({
//       path: "referrals",
//       select: "name mobile email", // return only needed fields
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       sponsor: {
//         id: user._id,
//         name: user.name,
//         mobile: user.mobile,
//       },
//       directReferrals: user.referrals,
//     });
//   } catch (error) {
//     console.error("G0 downline error:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch G0 downline", error: error.message });
//   }
// };

// getReferralTree

exports.getReferralTree = async (req, res) => {
  try {
    const userId = req.params.id;

    const buildTree = async (id) => {
      const user = await User.findById(id).populate("referrals");
      const tree = {
        _id: user._id,
        name: user.name,
        referrals: [],
      };

      for (const referral of user.referrals) {
        tree.referrals.push(await buildTree(referral._id));
      }

      return tree;
    };

    const tree = await buildTree(userId);
    res.status(200).json(tree);
  } catch (error) {
    console.error("Get referral tree error:", error);
    res.status(500).json({ message: "Failed to fetch referral tree" });
  }
};
