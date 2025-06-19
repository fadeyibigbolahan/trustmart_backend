const express = require("express");

const {
  addProductReview,
  getProductReviews,
} = require("../../controllers/shop/product-review-controller");

const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to add a product review (authentication required)
router.post("/add", protect, addProductReview);

// Route to get all reviews for a product (no authentication required)
router.get("/:productId", getProductReviews);

module.exports = router;
