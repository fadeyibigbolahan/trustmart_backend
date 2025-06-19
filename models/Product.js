const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: {
      type: [String], // Array of image URLs
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    category: String,
    brand: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: Number,
    totalStock: {
      type: Number,
      default: 0,
    },
    averageReview: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
