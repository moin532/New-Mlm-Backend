const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  LoginUser,
  Register,

  LoadUser,
  AddBankInfo,
  UpdateUser,
  changePassword,
  getGoDownline,
  getReferralTree,
  GetBankInfo,
} = require("../controller/userController");
const { authMiddle } = require("../middleware/auth");

router.route("/login").post(multer().none(), LoginUser);
router.route("/register").post(multer().none(), Register);

router.route("/me/:id").get(multer().none(), LoadUser);
router.route("/update/:id").get(multer().none(), UpdateUser);
router.route("/update/password").get(multer().none(), changePassword);
router.route("/bank/add").post(multer().none(), AddBankInfo);
// router.route("goDownLine/:id").post(multer().none(), getGoDownline);
router.route("/getRefral/:id").get(multer().none(), getReferralTree);
router.route("/get/BankInfo").get(multer().none(), GetBankInfo);

module.exports = router;
