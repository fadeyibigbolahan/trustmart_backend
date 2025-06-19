const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to add an item to the cart (authenticated user only)
router.post("/add", protect, addToCart);

// Route to get all items in the user's cart (authenticated user only)
router.get("/get/:userId", protect, fetchCartItems);

// Route to update the quantity of a cart item (authenticated user only)
router.put("/update-cart", protect, updateCartItemQty);

// Route to delete a cart item (authenticated user only)
router.delete("/:userId/:productId", protect, deleteCartItem);

module.exports = router;
