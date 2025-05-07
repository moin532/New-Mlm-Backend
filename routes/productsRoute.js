const express = require("express");
const router = express.Router();

const {
  authMiddle,
  authorizeRoles,
  authorizeAdmin,
} = require("../middleware/auth");
const {
  createProduct,
  getAllPRoducts,
  UpdateProduct,
  dltPrd,
  getSinglePrd,
  cretePrdReview,
  getAllAdminPrd,
} = require("../controller/productController");
const upload = require("../middleware/upload");

router.post(
  "/product/new",
  upload.array("images", 5),

  createProduct
);

router.route("/product/all").get(getAllPRoducts);

router.route("/admin/products").get(getAllAdminPrd);
router.route("/product/:id").get(getSinglePrd);

router.route("/admin/product/:id").put(UpdateProduct);
router.route("/admin/product/:id").delete(dltPrd);

router.route("/reviews").put(authMiddle, cretePrdReview);

// authMiddle , authorizeRoles("user")
module.exports = router;
