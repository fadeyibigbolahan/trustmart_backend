const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getVendorProducts,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// Get all products (with filters)
router.get("/get", getFilteredProducts);

// Get vendor-specific products
router.get("/vendor/:vendorId", getVendorProducts);

// Get single product details
router.get("/get/:id", getProductDetails);

module.exports = router;
