const express = require("express");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");

const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to add a new address (authenticated user only)
router.post("/add", protect, addAddress);

// Route to get all addresses for a user (authenticated user only)
router.get("/get/:userId", protect, fetchAllAddress);

// Route to delete an address (authenticated user only, ensure the user owns the address)
router.delete("/delete/:userId/:addressId", protect, deleteAddress);

// Route to update an address (authenticated user only, ensure the user owns the address)
router.put("/update/:userId/:addressId", protect, editAddress);

module.exports = router;
