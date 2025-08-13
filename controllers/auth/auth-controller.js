const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//register
const registerUser = async (req, res) => {
  const { userName, email, school, password } = req.body;
  console.log("Registering user:", req.body);

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      school,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: checkUser._id,
        roles: checkUser.roles,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY", // use env var in real apps
      { expiresIn: "60m" }
    );

    // Send token in JSON response
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: `Bearer ${token}`,
      user: {
        id: checkUser._id,
        email: checkUser.email,
        userName: checkUser.userName,
        roles: checkUser.roles,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  try {
    // Since token is stored client-side, backend doesn't need to clear cookies
    // Just respond with success, logout action is done on frontend by removing token
    res.json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while logging out",
    });
  }
};

// auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! No token provided",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY"
    );
    console.log("decoded", decoded);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! Invalid or expired token",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Forgot password request for email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await User.updateOne(
      { email },
      {
        resetToken,
        resetTokenExpiry,
      },
      { runValidators: false } // prevents checking required fields
    );

    console.log("Got here:", resetToken);
    const resetLink = `${process.env.CLIENT_URL}#/auth/reset-password/${resetToken}`;
    console.log("Reset link:", resetLink);

    // Setup email (basic transport)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("got here, pass auth (user and pass)");

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested a password reset.</p>
             <p><a href="${resetLink}">Click here to reset your password</a></p>`,
    });

    console.log("Password reset email sent:", user.email);

    res.json({ success: true, message: "Reset email sent!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user with matching valid token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save without running full validation
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
};
