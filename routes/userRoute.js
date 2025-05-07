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
  getReferralTree,
  GetBankInfo,
  getAllUsers,
  getDirectReferrals,
} = require("../controller/userController");
const { authMiddle, authorizeAdmin } = require("../middleware/auth");

router.route("/login").post(multer().none(), LoginUser);
router.route("/register").post(multer().none(), Register);

router.route("/me/:id").get(multer().none(), LoadUser);
router.route("/update/:id").post(multer().none(), UpdateUser);
router.route("/update/password").get(multer().none(), changePassword);
router.route("/bank/add").post(multer().none(), AddBankInfo);
// router.route("goDownLine/:id").post(multer().none(), getGoDownline);
router.route("/getRefral/:id").post(multer().none(), getReferralTree);
router.route("/get/direct/:id").post(multer().none(), getDirectReferrals); //this is Gynology treee

router.route("/get/BankInfo").post(multer().none(), GetBankInfo);
router.route("/get/users/admin").post(multer().none(), getAllUsers);

module.exports = router;
