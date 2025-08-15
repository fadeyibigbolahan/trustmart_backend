const WithdrawalRequest = require("../../models/WithdrawalRequest");

// Approve or reject a withdrawal request
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { status } = req.body; // approved or rejected
    const withdrawal = await WithdrawalRequest.findById(req.params.id).populate(
      "vendor"
    );

    if (!withdrawal)
      return res.status(404).json({ message: "Request not found" });

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (status === "approved") {
      withdrawal.vendor.balance -= withdrawal.amount;
      await withdrawal.vendor.save();
      withdrawal.status = "approved";
      withdrawal.processedAt = new Date();
    } else {
      withdrawal.status = "rejected";
      withdrawal.processedAt = new Date();
    }

    await withdrawal.save();
    res.json({ message: `Withdrawal ${status} successfully`, withdrawal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all withdrawal requests
const getAllWithdrawals = async (req, res) => {
  console.log("Fetching all withdrawal requests");
  try {
    const withdrawals = await WithdrawalRequest.find()
      .populate("vendor", "storeName balance") // show storeName and balance only
      .sort({ createdAt: -1 }); // latest first

    res.json({
      totalRequests: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  updateWithdrawalStatus,
  getAllWithdrawals,
};
