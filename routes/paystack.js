// routes/paystack.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

router.get("/banks", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.paystack.co/bank?currency=NGN",
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data.data); // Only return the bank array
  } catch (error) {
    console.error("Error fetching bank list:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch bank list from Paystack" });
  }
});

module.exports = router;
