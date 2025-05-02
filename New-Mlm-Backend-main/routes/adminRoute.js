const express = require("express");
const adminController = require("../controller/adminController");
const { isAdminAuthenticated } = require("../middleware/adminAuth");
const upload = require("../middleware/upload"); // Import the existing multer upload middleware

const router = express.Router();

// --- Admin Authentication ---
router.post("/admin/login", adminController.adminLogin);

// --- Admin Product Management ---
// Apply adminAuth middleware to all product routes below
// Apply multer upload middleware specifically for adding products (expecting multiple images in 'images' field)
router.post("/admin/products", isAdminAuthenticated, upload.array("images"), adminController.addProduct);
router.put("/admin/products/:id", isAdminAuthenticated, adminController.editProduct); // Multer not needed here unless implementing image updates
router.delete("/admin/products/:id", isAdminAuthenticated, adminController.deleteProduct);

// --- Admin User Management ---
// Apply adminAuth middleware to all user routes below
router.post("/admin/users", isAdminAuthenticated, adminController.addUser);
router.put("/admin/users/:id", isAdminAuthenticated, adminController.editUser);
router.delete("/admin/users/:id", isAdminAuthenticated, adminController.deleteUser);

// Optional: Route to get admin profile (if needed)
// router.get("/admin/profile", isAdminAuthenticated, (req, res) => {
//     // req.admin contains the authenticated admin details (excluding password hash)
//     res.status(200).json({ success: true, admin: req.admin });
// });

module.exports = router;

