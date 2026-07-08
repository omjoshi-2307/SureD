const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createEscrow,
  getEscrowById,
  getEscrowsByStudent,
  getEscrowsByLandlord,
} = require("../controllers/escrowController");

// All escrow routes are protected by authMiddleware
router.post("/", authMiddleware, createEscrow);
router.get("/:id", authMiddleware, getEscrowById);
router.get("/student/:wallet", authMiddleware, getEscrowsByStudent);
router.get("/landlord/:wallet", authMiddleware, getEscrowsByLandlord);

module.exports = router;
