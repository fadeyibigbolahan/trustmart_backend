const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
} = require("../../controllers/shop/products-controller");
const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to get filtered products (no authentication required by default)
router.get("/get", getFilteredProducts);

// Route to get a single product details by ID (no authentication required by default)
router.get("/get/:id", getProductDetails);

module.exports = router;
