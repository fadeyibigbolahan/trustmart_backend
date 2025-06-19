const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  wallet: {
    type: Number,
    default: 0, // Default wallet balance
  },
  roles: {
    type: [String],
    default: ["user"], // e.g., ['user'], ['user', 'vendor'], ['admin']
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
