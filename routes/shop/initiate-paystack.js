const express = require("express");
const router = express.Router();
const Paystack = require("paystack-api");
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);
const Vendor = require("../../models/Vendor");

router.post("/", async (req, res) => {
  const {
    userId,
    cartItems,
    addressInfo,
    totalAmount,
    orderDate,
    orderUpdateDate,
  } = req.body;

  const vendor = await Vendor.findOne({ user: userId });

  if (!vendor || !vendor.subaccountCode) {
    return res.status(400).json({
      success: false,
      message: "Vendor or subaccountCode not found",
    });
  }

  const vendorSubaccountCode = vendor.subaccountCode;

  console.log("Vendor Subaccount Code:", vendorSubaccountCode);

  try {
    const response = await paystack.transaction.initialize({
      email: req.user.email,
      amount: totalAmount * 100,
      callback_url: "http://localhost:5000/api/orders/paystack-callback",
      subaccount: vendorSubaccountCode, // ← ADD THIS (e.g., "SUB_acbd1234")
      bearer: "subaccount", // ← Vendor pays the fee, optional
      metadata: {
        cartItems,
        userId,
        addressInfo,
        orderDate,
        orderUpdateDate,
      },
    });

    res.json({ authorization_url: response.data.authorization_url });
  } catch (error) {
    console.error("Paystack initiation failed:", error.response?.data || error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate payment" });
  }
});

module.exports = router;
