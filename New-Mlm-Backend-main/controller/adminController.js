const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel"); 
const User = require("../models/userModel"); 

// Admin Login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() }).select("+passwordHash");

    if (!admin) {
      console.log("Admin not found for username:", username);
      return res.status(401).json({ success: false, message: "Invalid credentials" }); 
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log("Incorrect password for admin:", username);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, type: 'admin' }, 
      process.env.JWT_SECRET || "adminSecretKey",
      { expiresIn: "1h" } 
    );

    console.log("Admin login successful for:", username);

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


exports.addProduct = async (req, res) => {
  try {
  

    const { name, description, category, Stock } = req.body;

    if (!name || !description || !category || Stock === undefined) {
        return res.status(400).json({ success: false, message: "Missing required product fields (name, description, category, Stock)." });
    }

    let imagesData = [];
    if (req.files && req.files.length > 0) {
        imagesData = req.files.map(file => ({
           
            url: `/uploads/${file.filename}` 
        }));
    } else {
    }

    const productData = {
        name,
        description,
        category,
        Stock: Number(Stock),
        images: imagesData,
        user: req.user.id 
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

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

  
    const { name, description, category, Stock } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (Stock !== undefined) product.Stock = Number(Stock);

    

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

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    

    await product.deleteOne(); 

    res.status(200).json({
      success: true,
      message: "Product deleted successfully by admin",
    });

  } catch (error) {
    console.error("Admin Delete Product error:", error);
    res.status(500).json({ success: false, message: "Server error deleting product", error: error.message });
  }
};



// Add User (Admin only)
exports.addUser = async (req, res) => {
  try {
    const {
      name,
      sponsorId, 
      mobile,
      email,
      address,
      nomineeName,
      panCard,
      aadhaarCard,
      password,
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
      gender,
      nomineRelation,
      Address,
      State,
      Pincode
    });

    await user.setPassword(password);
    await user.save();
    console.log("User created successfully by admin:", user.name, "ID:", user._id);

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

    user.passwordHash = undefined; 

    res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
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

exports.editUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const adminId = req.user.id;
    console.log(`Admin ${adminId} attempting to update user ID: ${userIdToUpdate}`);

    if (!userIdToUpdate) {
        return res.status(400).json({ success: false, message: "User ID parameter is required." });
    }

    const user = await User.findById(userIdToUpdate);

    if (!user) {
      console.log("User not found for admin update, ID:", userIdToUpdate);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.password) {
      console.log("Admin resetting password for user:", user.name);
      await user.setPassword(req.body.password);
      delete req.body.password;
    }

    if (req.body.role) {
        console.warn(`Admin ${adminId} attempted to change role for user ${userIdToUpdate} via editUser endpoint. Ignoring role change.`);
        delete req.body.role; 
    }

    // List of allowed fields admin can update
    const allowedUpdates = [
      "name",
      "sponsorId", 
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

    updatedUser.passwordHash = undefined; 

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

  

    const user = await User.findById(userIdToDelete);

    if (!user) {
      console.log("User not found for admin deletion, ID:", userIdToDelete);
      return res.status(404).json({ success: false, message: "User not found" });
    }

   
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

