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

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        res
          .status(400)
          .send(`Role: ${req.user.role} is not allowed to access this resouce `)
      );
    }
    next();
  };
};
