const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel"); // Assuming product model path
const User = require("../models/userModel"); // Assuming user model path

// Admin Login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    // Find admin by username and select passwordHash explicitly
    const admin = await Admin.findOne({ username: username.toLowerCase() }).select("+passwordHash");

    if (!admin) {
      console.log("Admin not found for username:", username);
      return res.status(401).json({ success: false, message: "Invalid credentials" }); // Use 401 for unauthorized
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log("Incorrect password for admin:", username);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, type: 'admin' }, // Payload
      process.env.JWT_SECRET || "adminSecretKey", // Use a dedicated admin secret or env variable
      { expiresIn: "1h" } // Token expiration
    );

    console.log("Admin login successful for:", username);

    // Respond with token (don't send admin object back unless needed, exclude passwordHash)
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
    });

  } catch (err) {
    console.error("Admin Login error:", err);
    res.status(500).json({ success: false, message: "Server error during admin login" });
  }
};

// --- Product Management --- //

// Add Product (Admin only)
exports.addProduct = async (req, res) => {
  try {
    // req.user should be set by admin auth middleware
    // req.body should contain product details (name, description, category, Stock)
    // req.files should contain uploaded images if using multer for multiple files

    const { name, description, category, Stock } = req.body;

    if (!name || !description || !category || Stock === undefined) {
        return res.status(400).json({ success: false, message: "Missing required product fields (name, description, category, Stock)." });
    }

    let imagesData = [];
    if (req.files && req.files.length > 0) {
        imagesData = req.files.map(file => ({
            // Assuming you don't need public_id for local storage or it's handled differently
            // public_id: file.filename, // Example if needed
            url: `/uploads/${file.filename}` // Path relative to server root where files are served
        }));
    } else {
        // Handle case where no images are uploaded if required
        // return res.status(400).json({ success: false, message: "Product images are required." });
    }

    const productData = {
        name,
        description,
        category,
        Stock: Number(Stock),
        images: imagesData,
        user: req.user.id // Associate product with the admin who added it (optional)
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product added successfully by admin",
      product,
    });

  } catch (error) {
    console.error("Admin Add Product error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error adding product", error: error.message });
  }
};

// Edit Product (Admin only)
exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Simple update: replace fields provided in req.body
    // More complex logic needed for image updates (e.g., deleting old, adding new)
    const { name, description, category, Stock } = req.body;

    // Update fields if they are provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (Stock !== undefined) product.Stock = Number(Stock);

    // Note: Image update logic is NOT implemented here. 
    // It would typically involve checking req.files, potentially deleting old images 
    // from storage (and DB refs), and adding new ones.

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully by admin",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Admin Edit Product error:", error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error updating product", error: error.message });
  }
};

// Delete Product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Optional: Delete associated images from storage before deleting the DB record
    // This requires knowing where images are stored (e.g., local 'uploads/' folder)
    // Example for local storage (needs 'fs' module):
    /*
    const fs = require('fs').promises;
    const path = require('path');
    if (product.images && product.images.length > 0) {
        for (const image of product.images) {
            try {
                const imagePath = path.join(__dirname, '..', image.url); // Adjust path as needed
                await fs.unlink(imagePath);
                console.log(`Deleted image file: ${imagePath}`);
            } catch (imgErr) {
                console.error(`Error deleting image file ${image.url}:`, imgErr);
                // Decide if you should proceed or return an error
            }
        }
    }
    */

    await product.deleteOne(); // Use deleteOne() or remove()

    res.status(200).json({
      success: true,
      message: "Product deleted successfully by admin",
    });

  } catch (error) {
    console.error("Admin Delete Product error:", error);
    res.status(500).json({ success: false, message: "Server error deleting product", error: error.message });
  }
};

// --- User Management --- //

// Add User (Admin only)
exports.addUser = async (req, res) => {
  // Similar to userController.Register, but initiated by an admin
  try {
    const {
      name,
      sponsorId, // Optional: admin might assign sponsor
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      password,
      // role, // Admins typically add users with the default 'user' role via this kind of endpoint
      gender,
      nomineRelation,
      Address,
      State,
      Pincode
    } = req.body;

    console.log("Admin adding user with mobile:", mobile);

    // Basic validation
    if (!name || !mobile || !email || !address || !panCard || !aadhaarCard || !password) {
        return res.status(400).json({ success: false, message: "Missing required fields for user creation." });
    }

    const existingUser = await User.findOne({ $or: [{ mobile }, { panCard }, { aadhaarCard }] });
    if (existingUser) {
        let message = "User already exists with this ";
        if (existingUser.mobile === mobile) message += "mobile number.";
        else if (existingUser.panCard === panCard) message += "PAN card.";
        else message += "Aadhaar card.";
        console.log(message, "Mobile:", mobile);
        return res.status(400).json({ success: false, message });
    }

    // Create new user instance - role defaults to 'user' based on userModel
    const user = new User({
      name,
      referId: sponsorId || null,
      sponsorId: sponsorId || null,
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      // role: "user", // Explicitly set or rely on schema default if defined
      gender,
      nomineRelation,
      Address,
      State,
      Pincode
    });

    await user.setPassword(password);
    await user.save();
    console.log("User created successfully by admin:", user.name, "ID:", user._id);

    // Add to sponsor's referrals if sponsorId is provided
    if (sponsorId) {
      try {
          const sponsor = await User.findById(sponsorId);
          if (sponsor) {
            sponsor.referrals.push(user._id);
            await sponsor.save();
            console.log(`User ${user.name} added to sponsor ${sponsor.name}'s referrals by admin.`);
          } else {
            console.warn(`Admin provided sponsor ID ${sponsorId} not found.`);
          }
      } catch (sponsorError) {
          console.error(`Error updating sponsor ${sponsorId} during admin user creation:`, sponsorError);
      }
    }

    user.passwordHash = undefined; // Don't send hash back

    res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        // role: user.role, // Include role if needed
        referId: user.referId,
      },
    });

  } catch (error) {
    console.error("Admin Add User error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({
      success: false,
      message: "Server error during admin user creation",
      error: error.message,
    });
  }
};

// Edit User (Admin only)
exports.editUser = async (req, res) => {
  // Similar to userController.UpdateUser but with admin context
  try {
    const userIdToUpdate = req.params.id;
    const adminId = req.user.id; // Admin making the request

    console.log(`Admin ${adminId} attempting to update user ID: ${userIdToUpdate}`);

    if (!userIdToUpdate) {
        return res.status(400).json({ success: false, message: "User ID parameter is required." });
    }

    const user = await User.findById(userIdToUpdate);

    if (!user) {
      console.log("User not found for admin update, ID:", userIdToUpdate);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle password reset if provided
    if (req.body.password) {
      console.log("Admin resetting password for user:", user.name);
      await user.setPassword(req.body.password);
      // Remove password from req.body so it's not processed below
      delete req.body.password;
    }

    // Prevent admin from changing user roles via this endpoint (unless specifically designed for it)
    if (req.body.role) {
        console.warn(`Admin ${adminId} attempted to change role for user ${userIdToUpdate} via editUser endpoint. Ignoring role change.`);
        delete req.body.role; // Ignore role changes here
    }

    // List of allowed fields admin can update
    const allowedUpdates = [
      "name",
      "sponsorId", // Be cautious allowing this
      "mobile",
      "email",
      "address",
      "nomineeName",
      "panCard",
      "aadhaarCard",
      "nomineRelation",
      "Address",
      "State",
      "Pincode",
      "gender",
    ];

    Object.keys(req.body).forEach((field) => {
      if (allowedUpdates.includes(field) && req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    console.log("User updated successfully by admin:", updatedUser.name);

    updatedUser.passwordHash = undefined; // Don't send hash back

    res.status(200).json({
      success: true,
      message: "User updated successfully by admin",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Admin Edit User error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Update failed: Duplicate key error.", field: Object.keys(error.keyValue)[0] });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating user by admin",
      error: error.message,
    });
  }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const adminId = req.user.id;

    console.log(`Admin ${adminId} attempting to delete user ID: ${userIdToDelete}`);

    if (!userIdToDelete) {
        return res.status(400).json({ success: false, message: "User ID parameter is required." });
    }

    // Prevent admin from deleting themselves via this endpoint
    // if (userIdToDelete === adminId) { // This check requires comparing Admin ID and User ID, might not be applicable if separate collections
    //     return res.status(400).json({ success: false, message: "Cannot delete your own admin account via this endpoint." });
    // }

    const user = await User.findById(userIdToDelete);

    if (!user) {
      console.log("User not found for admin deletion, ID:", userIdToDelete);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- Complexities to consider (Out of scope for basic implementation): ---
    // 1. Referrals: What happens to users referred by the deleted user?
    // 2. Sponsor's list: Remove the deleted user from their sponsor's `referrals` array.
    // 3. Related data: Delete bank info, profile info, etc., associated with the user.
    // ------------------------------------------------------------------------

    // Simple Deletion:
    await user.deleteOne();
    console.log(`User ${userIdToDelete} deleted successfully by admin ${adminId}.`);

    // Optional: Remove from sponsor's list
    if (user.sponsorId) {
        try {
            await User.updateOne({ _id: user.sponsorId }, { $pull: { referrals: userIdToDelete } });
            console.log(`Removed user ${userIdToDelete} from sponsor ${user.sponsorId}'s referrals list.`);
        } catch (sponsorUpdateError) {
            console.error(`Error removing user ${userIdToDelete} from sponsor ${user.sponsorId}'s list:`, sponsorUpdateError);
        }
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully by admin",
    });

  } catch (error) {
    console.error("Admin Delete User error:", error);
    res.status(500).json({ success: false, message: "Server error deleting user by admin", error: error.message });
  }
};

