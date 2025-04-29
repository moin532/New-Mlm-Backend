// middleware/upload.js
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save in uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Add timestamp to avoid name clash
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only images are allowed"), false); // Reject file
  }
};

// Create upload instance
const upload = multer({ storage, fileFilter });

// Export upload
module.exports = upload;
