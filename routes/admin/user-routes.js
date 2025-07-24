const express = require("express");
const {
  fetchAllUsers,
  fetchAllVendors,
} = require("../../controllers/admin/user-controller");
const { protect, role } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to fetch all users
router.get("/all", fetchAllUsers);

router.get("/vendors", fetchAllVendors);

module.exports = router;
