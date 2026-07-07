const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { updateWallet } = require("../controllers/userController");

// Accessible by any logged-in user
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Student only
router.get(
  "/student",
  authMiddleware,
  authorizeRoles("student"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Student",
    });
  }
);

// Landlord only
router.get(
  "/landlord",
  authMiddleware,
  authorizeRoles("landlord"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Landlord",
    });
  }
);

// Admin only
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

// Update Wallet Address
router.put("/wallet", authMiddleware, updateWallet);

module.exports = router;