const express = require("express");
const router = express.Router();
const authLimiter = require("../middleware/rateLimiter");

const {
  register,
  login,
  googleLogin,
} = require("../controllers/authController");

router.use(authLimiter);
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

module.exports = router;