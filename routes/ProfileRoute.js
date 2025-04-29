const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const multipleUpload = upload.fields([
  { name: "panCardImage", maxCount: 1 },
  { name: "aadhaarCardFrontImage", maxCount: 1 },
  { name: "aadhaarCardBackImage", maxCount: 1 },
  { name: "bankDocumentImage", maxCount: 1 },

  // Nominee Images
  { name: "nomineePanCardImage", maxCount: 1 },
  { name: "nomineeAadhaarCardFrontImage", maxCount: 1 },
  { name: "nomineeAadhaarCardBackImage", maxCount: 1 },
  { name: "nomineeBankDocumentImage", maxCount: 1 },
]);

const { ProfilImageUpload } = require("../controller/ProfileController");
// router.route("/profile/update").post(multipleUpload, ProfilImageUpload);

module.exports = router;
