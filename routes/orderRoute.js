const express = require("express");
const router = express.Router();
const userController = require("../controller/orderController");

router.post("/wishlist", userController.addToWishlist);
router.get("/wishlist/:id", userController.getWishlistProducts);

router.post("/order", userController.placeOrder);
router.get("/order/:userId", userController.getOrders);
router.get("/orders/admin", userController.getAllWishlistsForAdmin);

module.exports = router;
