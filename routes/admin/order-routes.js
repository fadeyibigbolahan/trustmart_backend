const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const { protect, role } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Route to get all orders of all users (protected)
router.get("/get", protect, getAllOrdersOfAllUsers);

// Route to get order details for admin (only admins should have access)
router.get(
  "/details/:id",
  protect,
  role("admin", "vendor"),
  getOrderDetailsForAdmin
);

// Route to update the order status (only admins should have accesss)
router.put("/update/:id", protect, role("admin", "vendor"), updateOrderStatus);

module.exports = router;
