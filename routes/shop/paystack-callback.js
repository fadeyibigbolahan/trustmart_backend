// routes/orders/paystack-callback.js

const express = require("express");
const axios = require("axios");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const router = express.Router();

router.get("/paystack-callback", async (req, res) => {
  const { reference } = req.query;

  try {
    // 1. Verify transaction
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data.data;

    if (data.status !== "success") {
      return res.status(400).send("Payment failed or not verified.");
    }

    const metadata = data.metadata;

    // 2. Create the order
    const order = await Order.create({
      userId: metadata.userId,
      cartItems: metadata.cartItems,
      addressInfo: metadata.addressInfo,
      totalAmount: data.amount / 100,
      orderStatus: "pending",
      paymentStatus: "paid",
      paymentMethod: "paystack",
      paymentId: data.id,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    // 3. Clear user’s cart
    await Cart.findOneAndDelete({ userId: metadata.userId });

    // 4. Redirect or show confirmation
    res.redirect(`http://localhost:3000/order-success?ref=${reference}`);
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error);
    res.status(500).send("Internal Server Error.");
  }
});

module.exports = router;
