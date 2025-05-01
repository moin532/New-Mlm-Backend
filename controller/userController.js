const User = require("../models/userModel");
const Profile = require("../models/myProfileInfo");
const BankInfo = require("../models/BankInformation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.LoginUser = async (req, res, next) => {
  try {
    const { UUID, password } = req.body;

    console.log(UUID, password);

    const user = await User.findOne({ UUID: UUID }).select("+passwordHash");

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

const generateUUID = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  console.log(randomDigits);
  return `LS${randomDigits}`;
};
// Helper to generate a random 7-digit password
const generatePassword = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString(); // Ensure it's a valid string
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
    } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    const UUID = generateUUID();
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    let referId = null;
    let storedSponsorId = "";

    console.log(storedSponsorId, "stordSponserID");
    if (sponsorId) {
      const sponsor = await User.findOne({
        UUID: sponsorId,
      });

      if (sponsor) {
        referId = sponsor?.UUID;
        storedSponsorId = sponsorId;
      }
    }
    const user = new User({
      name,
      referId, // ObjectId or null
      sponsorId: storedSponsorId, // string or empty
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      passwordHash,
      UUID,
    });

    await user.save();

    if (referId) {
      const sponsor = await User.findById(referId);

      console.log("Sponsor Data:", referId);
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
        sponsorId: user.sponsorId,
        UUID: user.UUID,
        password: plainPassword,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
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
    const profile = await Profile.findOne({ userId: id });

    res.status(200).json({
      usere,
      profile,
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

    const allowedUpdates = [
      "city",
      "dateOfBirth",
      "gender",
      "pincode",
      "state",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "state" && typeof req.body[field] === "object") {
          user[field] = req.body[field].value;
        } else {
          user[field] = req.body[field];
        }
      }
    });

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

    if (!AccountNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }
    const Bankuser = await new BankInfo({
      AccountHolderName,
      AccountNumber,
      IFSC,
      BankName,
      BankBranch,
      AccountType,
      userId,
    });

    await Bankuser.save();

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
