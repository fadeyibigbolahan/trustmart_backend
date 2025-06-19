// utils/createSubaccount.js
const axios = require("axios");

async function createPaystackSubaccount({
  businessName,
  bankCode,
  accountNumber,
  percentageSplit,
}) {
  try {
    const response = await axios.post(
      "https://api.paystack.co/subaccount",
      {
        business_name: businessName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: percentageSplit, // e.g. 90 for 90%
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Returns the subaccount code you’ll use for split payments
    return response.data.data.subaccount_code;
  } catch (error) {
    console.error(
      "Error creating subaccount:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create subaccount");
  }
}

module.exports = createPaystackSubaccount;
