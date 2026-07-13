const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createEscrow,
  getEscrowById,
  getEscrowsByStudent,
  getEscrowsByLandlord,
  releaseEscrow,
  fundEscrow,
  confirmEscrow
} = require("../controllers/escrowController");

// All escrow routes are protected by authMiddleware
router.post("/", authMiddleware, createEscrow);
router.get("/student/:wallet", authMiddleware, getEscrowsByStudent);
router.get("/landlord/:wallet", authMiddleware, getEscrowsByLandlord);
router.get("/:id", authMiddleware, getEscrowById);
router.patch("/:id/fund", authMiddleware, fundEscrow);
router.patch("/:id/release", authMiddleware, releaseEscrow);
router.patch("/:id/confirm", authMiddleware, confirmEscrow);

module.exports = router;

router.patch("/:id/confirm", authMiddleware, (req, res, next) => {
  console.log("CONFIRM ROUTE HIT", req.params.id);
  next();
}, confirmEscrow);