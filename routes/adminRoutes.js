const express = require("express");
const multer = require("multer");
const {
  AdminSingleUser,
  UpdateUserActive,
} = require("../controller/adminController");
const router = express.Router();

router.post("/admin/user/:id", AdminSingleUser);
router.put("/user/active/:id", multer().none(), UpdateUserActive);

module.exports = router;
