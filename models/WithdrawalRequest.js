// models/WithdrawalRequest.js
const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "paystack"],
      default: "bank_transfer",
      required: true,
    },
    bankAccount: { type: String, required: true },
    accountHolder: { type: String, required: true },
    bankName: { type: String, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
