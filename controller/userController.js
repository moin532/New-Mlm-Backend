const User = require("../models/userModel");
const Profile = require("../models/myProfileInfo");
const BankInfo = require("../models/BankInformation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
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
      sponsorId, // UUID of the sponsor
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
    } = req.body;

    // Check if user exists by mobile
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    const UUID = generateUUID(); // your own UUID generator
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    let referId = null;

    // If sponsorId is provided (a UUID), find the user
    if (sponsorId) {
      const sponsor = await User.findOne({ UUID: sponsorId });

      console.log(sponsor, "Sponserr");

      if (sponsor) {
        referId = sponsor.UUID; // ✅ store sponsor UUID
      }
    }

    // Create new user
    const user = new User({
      name,
      referId, // UUID of sponsor (or null)
      sponsorId, // UUID provided by user
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
      const sponsor = await User.findOne({ UUID: referId });
      console.log(sponsor, "Regferer");

      if (sponsor) {
        sponsor.referrals.push(user.UUID); // Store referred user’s UUID
        await sponsor.save();
      }
    }

    // JWT Token
    const token = jwt.sign(
      { id: user.UUID, referId: user.referId },
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide sensitive info
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    const userId = req.params.id; // e.g., LS870517
    const tree = await buildTree(userId);

    if (!tree) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(tree);
  } catch (error) {
    console.error("Get referral tree error:", error);
    res.status(500).json({ message: "Failed to fetch referral tree" });
  }
};

const buildTree = async (uuid) => {
  const user = await User.findOne({ UUID: uuid });
  if (!user) return null;

  const tree = {
    UUID: user.UUID,
    name: user.name,
    referrals: [],
  };

  for (const referralUUID of user.referrals) {
    const child = await buildTree(referralUUID);
    if (child) {
      tree.referrals.push(child);
    }
  }

  return tree;
};

exports.getDirectReferrals = async (req, res) => {
  try {
    const userId = req.params.id; // e.g., LS870517
    const user = await User.findOne({ UUID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch only direct referral users
    const referrals = await User.find({ UUID: { $in: user.referrals } });

    res.status(200).json({
      UUID: user.UUID,
      name: user.name,
      referrals: referrals.map((ref) => ({
        UUID: ref.UUID,
        name: ref.name,
      })),
    });
  } catch (error) {
    console.error("Direct referrals fetch error:", error);
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
};

// exports.getReferralStats = async (req, res) => {
//   try {
//     const userId = req.params.id; // Example: LS870517

//     const user = await User.findOne({ UUID: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const directReferrals = await User.find({ UUID: { $in: user.referrals } });

//     let downlineCount = 0;
//     const queue = [...user.referrals];

//     while (queue.length > 0) {
//       const currentId = queue.shift();
//       const currentUser = await User.findOne({ UUID: currentId }, "referrals");

//       if (currentUser && currentUser.referrals?.length > 0) {
//         downlineCount += currentUser.referrals.length;
//         queue.push(...currentUser.referrals);
//       }
//     }

//     return res.status(200).json({
//       UUID: user.UUID,
//       name: user.name,
//       directCount: user.referrals.length,
//       downlineCount: downlineCount,
//     });
//   } catch (error) {
//     console.error("Referral stats error:", error);
//     return res.status(500).json({ message: "Failed to fetch referral stats" });
//   }
// };

// exports.getFullReferralTree = async (req, res) => {
//   try {
//     const userId = req.params.id; // Example: LS870517

//     const user = await User.findOne({ UUID: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Fetch sponsor's name for the main user
//     let sponsorName = null;
//     if (user.sponsorId) {
//       const sponsor = await User.findOne({ UUID: user.sponsorId });
//       if (sponsor) {
//         sponsorName = sponsor.name;
//       }
//     }

//     // Fetch direct referrals with sponsorName
//     const directReferrals = await Promise.all(
//       user.referrals.map(async (refId) => {
//         const referralUser = await User.findOne({ UUID: refId });
//         if (!referralUser) return null;

//         let referralSponsorName = null;
//         if (referralUser.sponsorId) {
//           const sponsor = await User.findOne({ UUID: referralUser.sponsorId });
//           if (sponsor) {
//             referralSponsorName = sponsor.name;
//           }
//         }

//         return {
//           ...referralUser.toObject(),
//           sponsorName: referralSponsorName,
//         };
//       })
//     );

//     // BFS to get all downline users with sponsorName
//     const visited = new Set();
//     const allDownlineUsers = [];
//     const queue = [...user.referrals];

//     while (queue.length > 0) {
//       const currentId = queue.shift();
//       if (visited.has(currentId)) continue;
//       visited.add(currentId);

//       const currentUser = await User.findOne({ UUID: currentId });
//       if (currentUser) {
//         // Fetch sponsor name
//         let currentSponsorName = null;
//         if (currentUser.sponsorId) {
//           const sponsor = await User.findOne({ UUID: currentUser.sponsorId });
//           if (sponsor) {
//             currentSponsorName = sponsor.name;
//           }
//         }

//         allDownlineUsers.push({
//           ...currentUser.toObject(),
//           sponsorName: currentSponsorName,
//         });

//         if (currentUser.referrals?.length > 0) {
//           queue.push(...currentUser.referrals);
//         }
//       }
//     }

//     return res.status(200).json({
//       UUID: user.UUID,
//       name: user.name,
//       sponsorId: user.sponsorId,
//       sponsorName: sponsorName,
//       directReferrals: directReferrals.filter(Boolean),
//       downlineUsers: allDownlineUsers,
//     });
//   } catch (error) {
//     console.error("Referral tree error:", error);
//     return res.status(500).json({ message: "Failed to fetch referral tree" });
//   }
// };

// otp

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ UUID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 1: Collect all users to avoid repeated DB calls
    const allUsers = await User.find({}, "UUID referrals");

    // Create a fast lookup map
    const userMap = new Map();
    allUsers.forEach((u) => userMap.set(u.UUID, u.referrals));

    // Step 2: Traverse the referral tree using the map
    let downlineCount = 0;
    const visited = new Set();
    const queue = [...user.referrals];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const referrals = userMap.get(currentId) || [];

      downlineCount += referrals.length;
      queue.push(...referrals);
    }

    return res.status(200).json({
      UUID: user.UUID,
      name: user.name,
      directCount: user.referrals.length,
      downlineCount: downlineCount,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return res.status(500).json({ message: "Failed to fetch referral stats" });
  }
};

exports.getFullReferralTree = async (req, res) => {
  try {
    const userId = req.params.id;

    // Step 1: Fetch all users once
    const allUsers = await User.find({}).lean();

    // Step 2: Create fast lookup maps
    const userMap = new Map();
    allUsers.forEach((u) => userMap.set(u.UUID, u));

    const user = userMap.get(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const getSponsorName = (sponsorId) => {
      const sponsor = userMap.get(sponsorId);
      return sponsor ? sponsor.name : null;
    };

    // Step 3: Get direct referrals
    const directReferrals = (user.referrals || [])
      .map((refId) => {
        const refUser = userMap.get(refId);
        if (!refUser) return null;

        return {
          ...refUser,
          sponsorName: getSponsorName(refUser.sponsorId),
        };
      })
      .filter(Boolean); // Remove nulls

    // Step 4: Traverse downline (BFS)
    const visited = new Set();
    const allDownlineUsers = [];
    const queue = [...user.referrals];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const currentUser = userMap.get(currentId);
      if (currentUser) {
        allDownlineUsers.push({
          ...currentUser,
          sponsorName: getSponsorName(currentUser.sponsorId),
        });

        if (currentUser.referrals?.length > 0) {
          queue.push(...currentUser.referrals);
        }
      }
    }

    return res.status(200).json({
      UUID: user.UUID,
      name: user.name,
      sponsorId: user.sponsorId,
      sponsorName: getSponsorName(user.sponsorId),
      directReferrals,
      downlineUsers: allDownlineUsers,
    });
  } catch (error) {
    console.error("Referral tree error:", error);
    return res.status(500).json({ message: "Failed to fetch referral tree" });
  }
};

let otpStore = {};

// Create transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});
// Send OTP Controller
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const otp = randomstring.generate({ length: 4, charset: "numeric" });
    otpStore[email] = otp;

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Your OTP Code",
      text: `${otp} is your OTP for Register  at Lipu Pvt Ltd. Never share it with anyone.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      res.status(200).json({ success: true, message: "OTP sent successfully" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// Verify OTP Controller
exports.VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    if (otpStore[email] !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid, delete from store
    delete otpStore[email];

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.AdminAddRank = async (req, res) => {
  try {
    const { rank } = req.body;

    // Validate input
    if (!rank) {
      return res
        .status(400)
        .json({ success: false, message: "Rank is required" });
    }

    // Find and update user by ID
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { rank } },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Rank updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
