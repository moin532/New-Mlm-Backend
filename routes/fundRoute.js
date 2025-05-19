const express = require("express");
const {
  addFundRequest,
  updateFundRequest,
  GetFundRequest,
  UpdateAdminFund,
} = require("../controller/fundController");
const router = express.Router();
const upload = require("../middleware/upload");
const multer = require("multer");

router.post("/add/fund", upload.single("image"), addFundRequest);
router.route("/update/fund/:id").post(multer().none(), updateFundRequest);
router.route("/get/funds").post(multer().none(), GetFundRequest);
router.route("/update/admin/:id").post(multer().none(), UpdateAdminFund);

module.exports = router;
