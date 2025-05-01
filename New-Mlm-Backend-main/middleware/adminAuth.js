const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

exports.isAdminAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 


  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "adminSecretKey"); 

    if (decoded.type !== 'admin') {
        return res.status(401).json({ success: false, message: "Not authorized, invalid token type." });
    }

    const currentAdmin = await Admin.findById(decoded.id);

    if (!currentAdmin) {
      return res.status(401).json({ success: false, message: "Admin belonging to this token does no longer exist." });
    }

    req.user = currentAdmin; 
    req.admin = currentAdmin;
    next();

  } catch (err) {
    console.error("Admin Authentication Error:", err);
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: "Not authorized, invalid token." });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: "Not authorized, token expired." });
    }
    return res.status(401).json({ success: false, message: "Not authorized." });
  }
};

