const express = require("express");
const router = express.Router();

const {
  updateWithdrawalStatus,
  getAllWithdrawals,
} = require("../../controllers/admin/withdrawal-controller");
const { protect, role } = require("../../middlewares/authMiddleware");

router.put("/:id", protect, role("admin"), updateWithdrawalStatus);
router.get("/", protect, role("admin"), getAllWithdrawals);

module.exports = router;
