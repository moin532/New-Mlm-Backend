const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res
      .status(200)
      .json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const { userId, products } = req.body;
    const order = new Order({
      user: userId,
      products,
    });
    await order.save();

    // Add order to user
    const user = await User.findById(userId);
    user.orders.push(order._id);
    await user.save();

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWishlistProducts = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find the user and populate wishlist
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch product details using wishlist ObjectIds
    const products = await Product.find({ _id: { $in: user.wishlist } });

    res.status(200).json({ wishlistProducts: products });
  } catch (error) {
    console.error("Error fetching wishlist products:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: "orders",
      populate: { path: "products.product" },
    });
    res.status(200).json(user.orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllWishlistsForAdmin = async (req, res) => {
  try {
    // Get users who have a non-empty wishlist
    const users = await User.find({
      wishlist: { $exists: true, $not: { $size: 0 } },
    }).select("name UUID wishlist");

    if (!users.length) {
      return res
        .status(200)
        .json({ message: "No wishlists found", wishlists: [] });
    }

    // Gather all unique product IDs from wishlists
    const allProductIds = users.flatMap((user) =>
      user.wishlist.map((id) => id.toString())
    );
    const uniqueProductIds = [...new Set(allProductIds)];

    // Fetch all related product details at once
    const productsMap = {};
    const products = await Product.find({
      _id: { $in: uniqueProductIds },
    }).select("title price image");

    products.forEach((product) => {
      productsMap[product._id.toString()] = product;
    });

    // Map product details to each user's wishlist
    const formattedData = users.map((user) => ({
      name: user.name,
      UUID: user.UUID,
      products: user.wishlist
        .map((id) => productsMap[id.toString()])
        .filter(Boolean), // remove any undefined (e.g., product deleted)
    }));

    res.status(200).json({ wishlists: formattedData });
  } catch (error) {
    console.error("Error fetching wishlists for admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};
