const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeName: { type: String, required: true },
    storeDescription: { type: String },
    isApproved: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    subaccountCode: { type: String }, // For Paystack split payments
    logo: { type: String }, // File path or URL to uploaded logo
    businessCertificate: { type: String }, // File path or URL to uploaded certificate
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", VendorSchema);
module.exports = Vendor;
