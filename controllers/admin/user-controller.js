const User = require("../../models/User");
const Vendor = require("../../models/Vendor");

const fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find({ roles: "user" }); // roles contains 'user'
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const fetchAllVendors = async (req, res) => {
  try {
    // Step 1: Find users with 'vendor' in roles
    const vendors = await User.find({ roles: { $in: ["vendor"] } });

    // Step 2: Populate vendor account for each user
    const populatedVendors = await Promise.all(
      vendors.map(async (user) => {
        const vendorAccount = await Vendor.findOne({ user: user._id });
        return {
          ...user.toObject(),
          vendorAccount, // this includes all fields from the Vendor model
        };
      })
    );

    res.status(200).json(populatedVendors);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching vendors", error: err.message });
  }
};

module.exports = {
  fetchAllUsers,
  fetchAllVendors,
};
