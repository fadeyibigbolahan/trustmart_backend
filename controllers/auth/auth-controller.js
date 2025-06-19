const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

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

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
