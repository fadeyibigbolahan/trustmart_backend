const express = require("express");

const {
  initiatePaystackPayment,
  verifyPaystackPayment,
  verifyOrderViaQuery,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");
const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/initiate-paystack", initiatePaystackPayment);

// Route to create an order (authenticated user only)
router.post("/create", protect, verifyPaystackPayment);

// Route to get all orders for a user (authenticated user only)
router.get("/list/:userId", protect, getAllOrdersByUser);

// Route to get order details (authenticated user only, and ensure the user owns the order)
router.get("/details/:id", protect, getOrderDetails);

router.get("/verify", verifyOrderViaQuery);

module.exports = router;
