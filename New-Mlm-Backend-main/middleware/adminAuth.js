const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

// Middleware to check if the user is an authenticated admin
exports.isAdminAuthenticated = async (req, res, next) => {
  // 1. Get token from header (Authorization: Bearer TOKEN)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // else if (req.cookies.token) { // Alternative: check cookies
  //   token = req.cookies.token;
  // }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "adminSecretKey"); // Use the same secret as in adminLogin

    // 3. Check if admin still exists and has the correct type/role in payload
    if (decoded.type !== 'admin') {
        return res.status(401).json({ success: false, message: "Not authorized, invalid token type." });
    }

    const currentAdmin = await Admin.findById(decoded.id);

    if (!currentAdmin) {
      return res.status(401).json({ success: false, message: "Admin belonging to this token does no longer exist." });
    }

    // 4. Grant access - Attach admin info to request object
    req.user = currentAdmin; // Use req.user standard practice, even though it's an admin
    req.admin = currentAdmin; // Or use req.admin specifically
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

