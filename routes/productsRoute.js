const express = require("express");
const router = express.Router();

const { authMiddle, authorizeRoles } = require("../middleware/auth");
const {
  createProduct,
  getAllPRoducts,
  UpdateProduct,
  dltPrd,
  getSinglePrd,
  cretePrdReview,
  getAllAdminPrd,
} = require("../controller/productController");

// Admin routes for product management
router.route("/admin/product/new").post(authMiddle, authorizeRoles("admin"), createProduct);
router.route("/admin/products").get(authMiddle, authorizeRoles("admin"), getAllAdminPrd);
router.route("/admin/product/:id").put(authMiddle, authorizeRoles("admin"), UpdateProduct);
router.route("/admin/product/:id").delete(authMiddle, authorizeRoles("admin"), dltPrd);

// Public routes
router.route("/product/all").get(getAllPRoducts);
router.route("/product/:id").get(getSinglePrd);

// User routes
router.route("/reviews").put(authMiddle, cretePrdReview);

module.exports = router;

