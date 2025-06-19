const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middlewares/authMiddleware");
const axios = require("axios");

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch cart with product details
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "price vendor vendorSubaccount", // vendorSubaccount = Paystack subaccount code
      populate: { path: "vendor", select: "storeName" },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // 2. Calculate total amount and vendor subtotals
    let totalAmount = 0; // in kobo
    const vendorTotals = {};

    cart.items.forEach(({ productId, quantity }) => {
      const priceKobo = Math.round(productId.price * 100);
      const subtotal = priceKobo * quantity;

      totalAmount += subtotal;

      const subaccount = productId.vendorSubaccount;
      if (!vendorTotals[subaccount]) vendorTotals[subaccount] = 0;
      vendorTotals[subaccount] += subtotal;
    });

    // 3. Prepare Paystack split payment subaccounts (90% share each)
    const subaccounts = Object.entries(vendorTotals).map(
      ([subaccount, subtotal]) => ({
        subaccount,
        share: Math.round(subtotal * 0.9),
      })
    );

    // 4. Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: totalAmount,
        currency: "NGN",
        subaccounts,
        // Optional: callback_url: "https://yourdomain.com/payment/callback",
        callback_url: "http://localhost:5000/api/orders/paystack-callback",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 5. Send back Paystack payment URL to frontend
    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Checkout error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initialization failed." });
  }
});

module.exports = router;
