const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.authMiddle = async (req, res, next) => {
  try {
    const Token = req.headers.authorization;

    if (!Token) {
      return res.status(404).json({
        err: " Token is empty",
      });
    }

    const decoded = jwt.verify(Token, process.env.JWT_KEY);
    req.user = await User.findById(decoded.user_id);

    next();
  } catch (error) {
    return res.status(400).json({
      err: error.message,
    });
  }
};

exports.authorizeAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Get user from database
    const user = await User.findOne({ UUID });

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: `Access denied: ${
          user?.role || "unknown"
        } role is not allowed`,
      });
    }

    // Attach user to request for next middlewares
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
