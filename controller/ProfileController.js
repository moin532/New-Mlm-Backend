const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Profile = require("../models/myProfileInfo");

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
    { name: "video" },
    { name: "myProfile" },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const userId = req.body.userId;

      const normalizePath = (p) => p?.replace(/\\/g, "/");

      let existingProfile = await Profile.findOne({ userId });

      const profileData = {
        userId: userId,
        myintro: normalizePath(
          files.video?.[0]?.path || existingProfile?.video
        ),
        myimage: normalizePath(
          files.myProfile?.[0]?.path || existingProfile?.myProfile
        ),
        panCardImage:
          files.panCardImage?.[0]?.path || existingProfile?.panCardImage,
        aadhaarCardFrontImage:
          files.aadhaarCardFrontImage?.[0]?.path ||
          existingProfile?.aadhaarCardFrontImage,
        aadhaarCardBackImage:
          files.aadhaarCardBackImage?.[0]?.path ||
          existingProfile?.aadhaarCardBackImage,
        bankDocumentImage:
          files.bankDocumentImage?.[0]?.path ||
          existingProfile?.bankDocumentImage,
        nominee: {
          name: req.body.nomineeName || existingProfile?.nominee?.name,
          relation:
            req.body.nomineeRelation || existingProfile?.nominee?.relation,
          panCardNumber:
            req.body.nomineePanCardNumber ||
            existingProfile?.nominee?.panCardNumber,
          aadhaarCardNumber:
            req.body.nomineeAadhaarCardNumber ||
            existingProfile?.nominee?.aadhaarCardNumber,
          panCardImage:
            files.nomineePanCardImage?.[0]?.path ||
            existingProfile?.nominee?.panCardImage,
          aadhaarCardFrontImage:
            files.nomineeAadhaarCardFrontImage?.[0]?.path ||
            existingProfile?.nominee?.aadhaarCardFrontImage,
          aadhaarCardBackImage:
            files.nomineeAadhaarCardBackImage?.[0]?.path ||
            existingProfile?.nominee?.aadhaarCardBackImage,
          bankDocumentImage:
            files.nomineeBankDocumentImage?.[0]?.path ||
            existingProfile?.nominee?.bankDocumentImage,
        },
      };

      console.log(profileData);
      const profile = await Profile.findOneAndUpdate({ userId }, profileData, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });

      res
        .status(201)
        .json({ message: "Profile uploaded/updated successfully", profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed", error });
    }
  }
);

router.post(
  "/upload/media",
  upload.fields([
    { name: "myProfile", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const userId = req.body.userId;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const normalizePath = (p) => p?.replace(/\\/g, "/");

      const updateData = {
        ...(files.myProfile && {
          myProfile: normalizePath(files.myProfile[0].path),
        }),
        ...(files.video && {
          video: normalizePath(files.video[0].path),
        }),
      };

      const profile = await Profile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({
        message: "Media uploaded successfully",
        profile,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error });
    }
  }
);

module.exports = router;
