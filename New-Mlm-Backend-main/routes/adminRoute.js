const express = require("express");
const adminController = require("../controller/adminController");
const { isAdminAuthenticated } = require("../middleware/adminAuth");
const upload = require("../middleware/upload"); 

const router = express.Router();

// --- Admin Authentication ---
router.post("/admin/login", adminController.adminLogin);


router.post("/admin/products", isAdminAuthenticated, upload.array("images"), adminController.addProduct);
router.put("/admin/products/:id", isAdminAuthenticated, adminController.editProduct);
router.delete("/admin/products/:id", isAdminAuthenticated, adminController.deleteProduct);


router.post("/admin/users", isAdminAuthenticated, adminController.addUser);
router.put("/admin/users/:id", isAdminAuthenticated, adminController.editUser);
router.delete("/admin/users/:id", isAdminAuthenticated, adminController.deleteUser);



module.exports = router;

