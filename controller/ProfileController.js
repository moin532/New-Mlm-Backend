// routes/profile.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Profile = require("../models/myProfileInfo");

// Upload multiple images
router.post(
  "/upload",
  upload.fields([
    { name: "panCardImage" },
    { name: "aadhaarCardFrontImage" },
    { name: "aadhaarCardBackImage" },
    { name: "bankDocumentImage" },
    { name: "nomineePanCardImage" },
    { name: "nomineeAadhaarCardFrontImage" },
    { name: "nomineeAadhaarCardBackImage" },
    { name: "nomineeBankDocumentImage" },
  ]),
  async (req, res) => {
    try {
      const files = req.files;

      const profile = new Profile({
        userId: req.body.userId,
        panCardImage: files.panCardImage?.[0]?.path,
        aadhaarCardFrontImage: files.aadhaarCardFrontImage?.[0]?.path,
        aadhaarCardBackImage: files.aadhaarCardBackImage?.[0]?.path,
        bankDocumentImage: files.bankDocumentImage?.[0]?.path,
        nominee: {
          name: req.body.nomineeName,
          relation: req.body.nomineeRelation,
          panCardNumber: req.body.nomineePanCardNumber,
          aadhaarCardNumber: req.body.nomineeAadhaarCardNumber,
          panCardImage: files.nomineePanCardImage?.[0]?.path,
          aadhaarCardFrontImage: files.nomineeAadhaarCardFrontImage?.[0]?.path,
          aadhaarCardBackImage: files.nomineeAadhaarCardBackImage?.[0]?.path,
          bankDocumentImage: files.nomineeBankDocumentImage?.[0]?.path,
        },
      });

      await profile.save();
      res.status(201).json({ message: "Profile saved successfully", profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed", error });
    }
  }
);

module.exports = router;
