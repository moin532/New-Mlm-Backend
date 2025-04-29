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

router.route("/product/new").post(authMiddle, createProduct);
router.route("/product/all").get(getAllPRoducts);

router.route("/admin/products").get(authMiddle, getAllAdminPrd);
router.route("/product/:id").get(getSinglePrd);

router.route("/admin/product/:id").put(UpdateProduct);
router.route("/admin/product/:id").delete(dltPrd);

router.route("/reviews").put(authMiddle, cretePrdReview);

// authMiddle , authorizeRoles("user")
module.exports = router;
