const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
} = require("../../controllers/common/feature-controller");

const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to add a feature image (authentication required)
router.post("/add", protect, addFeatureImage);

// Route to get all feature images (no authentication required)
router.get("/get", getFeatureImages);

module.exports = router;
