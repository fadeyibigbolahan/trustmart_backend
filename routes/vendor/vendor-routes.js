const express = require("express");

const {
  registerVendor,
  getMyVendorProfile,
  getAllVendors,
  approveVendor,
} = require("../../controllers/vendor/vendor-controller");
const { protect, role } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/upload");

const router = express.Router();

// Route: POST /api/vendors/register
router.post(
  "/register",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "businessCertificate", maxCount: 1 },
  ]),
  registerVendor
);

// Route: GET /api/vendors/me
router.get("/me", protect, getMyVendorProfile);

// Route: GET /api/vendors (admin only)
router.get("/", protect, role("admin"), getAllVendors);

// Route: PUT /api/vendors/:id/approve (admin only)
router.put("/:id/approve", protect, role("admin"), approveVendor);

module.exports = router;
