const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

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

module.exports = router;