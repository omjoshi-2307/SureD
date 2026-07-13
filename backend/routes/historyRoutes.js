const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getHistoryByEscrow,
  getHistoryByStudent,
  getHistoryByLandlord,
  getHistoryByWallet,
} = require("../controllers/historyController");

// By escrow numeric ID
router.get("/escrow/:escrowId", authMiddleware, getHistoryByEscrow);

// By actor wallet (role-specific aliases kept for backward-compat)
router.get("/student/:wallet", authMiddleware, getHistoryByStudent);
router.get("/landlord/:wallet", authMiddleware, getHistoryByLandlord);

// Role-agnostic wallet lookup — used by the frontend TransactionHistoryPage
router.get("/wallet/:wallet", authMiddleware, getHistoryByWallet);

module.exports = router;
