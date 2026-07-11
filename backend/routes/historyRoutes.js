const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getHistoryByEscrow,
  getHistoryByStudent,
  getHistoryByLandlord,
} = require("../controllers/historyController");

router.get("/escrow/:escrowId", authMiddleware, getHistoryByEscrow);
router.get("/student/:wallet", authMiddleware, getHistoryByStudent);
router.get("/landlord/:wallet", authMiddleware, getHistoryByLandlord);

module.exports = router;
