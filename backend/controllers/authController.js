const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "student",
    });

    await user.save();

    // Generate JWT Token so user logs in directly upon registration
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress || "",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential, name, email, picture, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    // Verify the Google credential
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: "Google token verification failed.",
        error: verifyErr.message,
      });
    }

    const verifiedEmail = payload.email;
    const verifiedName = name || payload.name || "Google User";
    const verifiedPicture = picture || payload.picture || "";

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        message: "Google account has no email address.",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: verifiedEmail });

    if (user) {
      // Existing user — log in
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Google login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress || "",
          provider: user.provider,
        },
      });
    }

    // New user — needs role to proceed
    if (!role) {
      return res.status(200).json({
        success: true,
        isNewUser: true,
        needsRole: true,
        email: verifiedEmail,
        name: verifiedName,
        picture: verifiedPicture,
      });
    }

    // Create new user with the selected role
    const newUser = await User.create({
      name: verifiedName,
      email: verifiedEmail,
      password: "",
      role,
      provider: "google",
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Google account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        walletAddress: newUser.walletAddress || "",
        provider: newUser.provider,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({
      success: false,
      message: "Google authentication failed.",
      error: err.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Forgot Password - Generate 6-digit OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    console.log(`🔑 Password reset OTP for ${user.email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "Password reset verification code generated successfully.",
      otp: otp, // Included for development / testing convenience
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reset Password - Verify OTP & update password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP code, and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordOtp: otp.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset verification code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};