const Vendor = require("../../models/Vendor");
const User = require("../../models/User");
const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const registerVendor = async (req, res) => {
  try {
    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ message: "Already registered as vendor." });
    }

    // Fetch user details
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Optional: Push 'vendor' role if not already present
    if (!user.roles.includes("vendor")) {
      user.roles.push("vendor");
      await user.save();
    }

    // Get form values
    const { storeName, storeDescription } = req.body;

    // Expecting req.body.bankDetails (passed from frontend):
    // {
    //   account_number: "0123456789",
    //   bank_code: "044",
    //   business_name: "My Store"
    // }

    // === Create Paystack Subaccount ===
    const subaccountPayload = {
      business_name: storeName,
      settlement_bank: req.body.bankCode,
      account_number: req.body.accountNumber,
      percentage_charge: 10, // Trustmart keeps 10%
    };

    const paystackResponse = await axios.post(
      "https://api.paystack.co/subaccount",
      subaccountPayload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const subaccountCode = paystackResponse.data.data.subaccount_code;

    const logoUrl = req.files?.logo?.[0]?.path || null;
    const certificateUrl = req.files?.businessCertificate?.[0]?.path || null;

    // === Save Vendor Record ===
    const vendor = new Vendor({
      user: req.user._id,
      storeName,
      storeDescription,
      isApproved: false,
      balance: 0,
      subaccountCode, // store for use during split payments
      logo: logoUrl,
      businessCertificate: certificateUrl,
    });

    await vendor.save();

    res.status(201).json({ message: "Vendor registration submitted." });
  } catch (err) {
    console.error(
      "Vendor registration failed:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Vendor registration failed. Please try again.",
      error: err.response?.data || err.message,
    });
  }
};

const getMyVendorProfile = async (req, res) => {
  console.log("ven profile");
  const vendor = await Vendor.findOne({ user: req.user._id }).populate(
    "user",
    "name email"
  );
  if (!vendor)
    return res.status(404).json({ message: "Vendor profile not found." });
  res.json({ vendor });
};

const getAllVendors = async (req, res) => {
  const vendors = await Vendor.find().populate("user", "name email");
  res.json(vendors);
};

const approveVendor = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).populate("user");

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  vendor.isApproved = req.body.isApproved;

  if (req.body.isApproved) {
    // Add 'vendor' role to user if not already present
    if (!vendor.user.roles.includes("vendor")) {
      vendor.user.roles.push("vendor");
      await vendor.user.save();
    }
  } else {
    // Optionally remove 'vendor' role if disapproved
    vendor.user.roles = vendor.user.roles.filter((r) => r !== "vendor");
    await vendor.user.save();
  }

  await vendor.save();

  res.json({
    message: `Vendor ${req.body.isApproved ? "approved" : "disapproved"}`,
  });
};

module.exports = {
  registerVendor,
  getMyVendorProfile,
  getAllVendors,
  approveVendor,
};
