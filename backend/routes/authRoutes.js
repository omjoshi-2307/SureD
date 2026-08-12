const express = require("express");
const router = express.Router();
const authLimiter = require("../middleware/rateLimiter");

const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.use(authLimiter);
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;