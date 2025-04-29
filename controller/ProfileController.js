// const Profile = require("../models/myProfileInfo");

// export const ProfilImageUpload = async (req, res) => {
//   try {
//     const {
//       nomineeName,
//       nomineeRelation,
//       nomineePanCardNumber,
//       nomineeAadhaarCardNumber,
//       userId,
//     } = req.body;

//     const newProfile = new Profile({
//       userId: userId, // assuming you have `req.user` from auth middleware
//       panCardImage: req.files?.panCardImage?.[0]?.path,
//       aadhaarCardFrontImage: req.files?.aadhaarCardFrontImage?.[0]?.path,
//       aadhaarCardBackImage: req.files?.aadhaarCardBackImage?.[0]?.path,
//       bankDocumentImage: req.files?.bankDocumentImage?.[0]?.path,
//       nominee: {
//         name: nomineeName,
//         relation: nomineeRelation,
//         panCardNumber: nomineePanCardNumber,
//         aadhaarCardNumber: nomineeAadhaarCardNumber,
//         panCardImage: req.files?.nomineePanCardImage?.[0]?.path,
//         aadhaarCardFrontImage:
//           req.files?.nomineeAadhaarCardFrontImage?.[0]?.path,
//         aadhaarCardBackImage: req.files?.nomineeAadhaarCardBackImage?.[0]?.path,
//         bankDocumentImage: req.files?.nomineeBankDocumentImage?.[0]?.path,
//       },
//     });

//     await newProfile.save();

//     res.status(201).json({ success: true, profile: newProfile });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
