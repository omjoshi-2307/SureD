const Escrow = require("../models/Escrow");
const User = require("../models/User");
const { createHistoryRecord } = require("./historyController");

// ─── Ownership Helper ─────────────────────────────────────────────────────────
// The JWT only carries { id, role } — it does NOT carry a wallet address.
// So to know whether the logged-in user is actually the student or landlord
// on THIS specific escrow, we have to look up their saved walletAddress and
// compare it to the escrow's studentWallet / landlordWallet.
async function getRequesterWallet(userId) {
  const user = await User.findById(userId).select("walletAddress role");
  return user ? user.walletAddress : null;
}

function walletsMatch(a, b) {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

// ─── Create Escrow ────────────────────────────────────────────────────────────
exports.createEscrow = async (req, res) => {
  try {
    const {
      escrowId,
      transactionHash,
      studentWallet,
      landlordWallet,
      propertyName,
      propertyAddress,
      depositAmount,
      currency,
      rentalStartDate,
      rentalEndDate,
      purpose,
      contractId,
      blockchainNetwork,
    } = req.body;

    // Validation
    if (
      !transactionHash ||
      !studentWallet ||
      !landlordWallet ||
      !propertyName ||
      !propertyAddress ||
      !depositAmount ||
      !rentalStartDate ||
      !rentalEndDate ||
      !purpose ||
      !contractId ||
      !blockchainNetwork
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check for duplicate transaction hash
    const existingEscrow = await Escrow.findOne({ transactionHash });
    if (existingEscrow) {
      return res.status(409).json({
        success: false,
        message: "An escrow with this transaction hash already exists",
      });
    }

    const escrow = new Escrow({
      escrowId: escrowId !== undefined ? Number(escrowId) : undefined,
      transactionHash,
      studentWallet,
      landlordWallet,
      propertyName,
      propertyAddress,
      depositAmount: Number(depositAmount),
      currency: currency || "XLM",
      rentalStartDate: new Date(rentalStartDate),
      rentalEndDate: new Date(rentalEndDate),
      purpose,
      contractId,
      blockchainNetwork,
      status: "CREATED",
    });

    await escrow.save();

    // ── Record history (fire-and-forget, never blocks response) ──
    createHistoryRecord({
      escrowId: escrow.escrowId,
      mongoEscrowId: String(escrow._id),
      txHash: transactionHash,
      action: "ESCROW_CREATED",
      actorWallet: studentWallet,
      role: "student",
      propertyName: propertyName,
      amount: Number(depositAmount),
      currency: currency || "XLM",
      network: blockchainNetwork,
      contractId: contractId,
      statusBefore: null,
      statusAfter: "CREATED",
    }).catch((err) => console.error("History record error (createEscrow):", err.message));

    res.status(201).json({
      success: true,
      escrow,
    });
  } catch (error) {
    console.error("Create Escrow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Get Escrow by ID (MongoDB _id or contract escrowId) ─────────────────────
exports.getEscrowById = async (req, res) => {
  try {
    const { id } = req.params;

    let escrow;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    res.status(200).json({
      success: true,
      escrow,
    });
  } catch (error) {
    console.error("Get Escrow By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Get Escrows by Student Wallet ────────────────────────────────────────────
exports.getEscrowsByStudent = async (req, res) => {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // ── Ownership check ── prevent viewing another user's escrow history
    if (req.user.role !== "admin") {
      const requesterWallet = await getRequesterWallet(req.user.id);
      if (!walletsMatch(requesterWallet, wallet)) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own escrow history",
        });
      }
    }

    const escrows = await Escrow.find({ studentWallet: wallet });

    res.status(200).json({
      success: true,
      escrows,
    });
  } catch (error) {
    console.error("Get Escrows By Student Wallet Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Get Escrows by Landlord Wallet ───────────────────────────────────────────
exports.getEscrowsByLandlord = async (req, res) => {
  try {
    const { wallet } = req.params;

    console.log("Requested landlord wallet:", wallet);

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // ── Ownership check ── prevent viewing another user's escrow history
    if (req.user.role !== "admin") {
      const requesterWallet = await getRequesterWallet(req.user.id);
      if (!walletsMatch(requesterWallet, wallet)) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own escrow history",
        });
      }
    }

    const escrows = await Escrow.find({ landlordWallet: wallet });

    console.log("Escrows found:", escrows.length);

    res.status(200).json({
      success: true,
      escrows,
    });
  } catch (error) {
    console.error("Get Escrows By Landlord Wallet Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Fund Escrow ──────────────────────────────────────────────────────────────
exports.fundEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Funding transaction hash is required",
      });
    }

    let escrow;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // ── Ownership check ──
    // Only the student who this escrow belongs to may fund it.
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only the student on this escrow can fund it",
      });
    }
    const requesterWallet = await getRequesterWallet(req.user.id);
    if (!walletsMatch(requesterWallet, escrow.studentWallet)) {
      return res.status(403).json({
        success: false,
        message: "You are not the student associated with this escrow",
      });
    }

    if (escrow.status !== "CREATED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is already funded or cannot be funded",
      });
    }

    const statusBefore = escrow.status;
    escrow.status = "FUNDED";
    escrow.fundedTxHash = txHash;
    escrow.fundedAt = new Date();

    await escrow.save();

    // ── Record history ──
    createHistoryRecord({
      escrowId: escrow.escrowId,
      mongoEscrowId: String(escrow._id),
      txHash,
      action: "DEPOSIT",
      actorWallet: escrow.studentWallet,
      role: "student",
      propertyName: escrow.propertyName,
      amount: escrow.depositAmount,
      currency: escrow.currency,
      network: escrow.blockchainNetwork,
      contractId: escrow.contractId,
      statusBefore,
      statusAfter: "FUNDED",
    }).catch((err) => console.error("History record error (fundEscrow):", err.message));

    res.status(200).json({
      success: true,
      message: "Escrow funded successfully",
      escrow,
    });
  } catch (error) {
    console.error("Fund Escrow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Confirm Escrow ───────────────────────────────────────────────────────────
exports.confirmEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Confirmation transaction hash is required",
      });
    }

    let escrow;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    if (escrow.status === "PENDING_CONFIRMATION") {
      return res.status(400).json({
        success: false,
        message: "Escrow already confirmed by both parties",
      });
    }

    if (escrow.status !== "FUNDED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is not funded",
      });
    }

    if (req.user.role === "student" && escrow.studentConfirmed) {
      return res.status(400).json({
        success: false,
        message: "Student has already confirmed",
      });
    }

    if (req.user.role === "landlord" && escrow.landlordConfirmed) {
      return res.status(400).json({
        success: false,
        message: "Landlord has already confirmed",
      });
    }

    // ── Ownership check ──
    // Confirm that the logged-in user's saved wallet actually matches the
    // student/landlord wallet recorded on THIS escrow, not just that they
    // hold the right role in general.
    if (req.user.role !== "student" && req.user.role !== "landlord") {
      return res.status(403).json({
        success: false,
        message: "Only the student or landlord on this escrow can confirm it",
      });
    }
    const requesterWallet = await getRequesterWallet(req.user.id);
    const expectedWallet =
      req.user.role === "student" ? escrow.studentWallet : escrow.landlordWallet;
    if (!walletsMatch(requesterWallet, expectedWallet)) {
      return res.status(403).json({
        success: false,
        message: "You are not a party to this escrow",
      });
    }

    const statusBefore = escrow.status;
    const actorRole = req.user.role;
    const actorWallet =
      actorRole === "student" ? escrow.studentWallet : escrow.landlordWallet;

    if (actorRole === "student") {
      escrow.studentConfirmed = true;
    } else if (actorRole === "landlord") {
      escrow.landlordConfirmed = true;
    }

    let statusAfter = escrow.status;
    if (escrow.studentConfirmed && escrow.landlordConfirmed) {
      escrow.status = "PENDING_CONFIRMATION";
      escrow.confirmTxHash = txHash;
      escrow.confirmedAt = new Date();
      statusAfter = "PENDING_CONFIRMATION";
    }

    await escrow.save();

    // ── Record history ──
    const action =
      actorRole === "student" ? "STUDENT_CONFIRM" : "LANDLORD_CONFIRM";

    createHistoryRecord({
      escrowId: escrow.escrowId,
      mongoEscrowId: String(escrow._id),
      txHash,
      action,
      actorWallet,
      role: actorRole,
      propertyName: escrow.propertyName,
      amount: escrow.depositAmount,
      currency: escrow.currency,
      network: escrow.blockchainNetwork,
      contractId: escrow.contractId,
      statusBefore,
      statusAfter,
    }).catch((err) => console.error("History record error (confirmEscrow):", err.message));

    res.status(200).json({
      success: true,
      message: "Escrow confirmation recorded successfully",
      escrow,
    });
  } catch (error) {
    console.error("Confirm Escrow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Release Escrow ───────────────────────────────────────────────────────────
exports.releaseEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Release transaction hash is required",
      });
    }

    let escrow;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // ── Ownership check ──
    // Only the landlord who this escrow belongs to may release it.
    if (req.user.role !== "landlord") {
      return res.status(403).json({
        success: false,
        message: "Only the landlord on this escrow can release it",
      });
    }
    const requesterWallet = await getRequesterWallet(req.user.id);
    if (!walletsMatch(requesterWallet, escrow.landlordWallet)) {
      return res.status(403).json({
        success: false,
        message: "You are not the landlord associated with this escrow",
      });
    }

    if (escrow.status === "RELEASED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is already released",
      });
    }

    if (escrow.status !== "PENDING_CONFIRMATION") {
      return res.status(400).json({
        success: false,
        message: "Escrow is not ready for release",
      });
    }

    const statusBefore = escrow.status;
    escrow.status = "RELEASED";
    escrow.releasedTxHash = txHash;
    escrow.releasedAt = new Date();

    await escrow.save();

    // ── Record history ──
    createHistoryRecord({
      escrowId: escrow.escrowId,
      mongoEscrowId: String(escrow._id),
      txHash,
      action: "RELEASE",
      actorWallet: escrow.landlordWallet,
      role: "landlord",
      propertyName: escrow.propertyName,
      amount: escrow.depositAmount,
      currency: escrow.currency,
      network: escrow.blockchainNetwork,
      contractId: escrow.contractId,
      statusBefore,
      statusAfter: "RELEASED",
    }).catch((err) => console.error("History record error (releaseEscrow):", err.message));

    res.status(200).json({
      success: true,
      message: "Escrow released successfully",
      escrow,
    });
  } catch (error) {
    console.error("Release Escrow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.refundEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Refund transaction hash is required",
      });
    }

    let escrow;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // Only the landlord can refund
    if (req.user.role !== "landlord") {
      return res.status(403).json({
        success: false,
        message: "Only the landlord on this escrow can refund it",
      });
    }

    const requesterWallet = await getRequesterWallet(req.user.id);

    if (!walletsMatch(requesterWallet, escrow.landlordWallet)) {
      return res.status(403).json({
        success: false,
        message: "You are not the landlord associated with this escrow",
      });
    }

    // Match Soroban contract logic
    if (
      escrow.status !== "FUNDED" &&
      escrow.status !== "PENDING_CONFIRMATION"
    ) {
      return res.status(400).json({
        success: false,
        message: "Escrow cannot be refunded in its current state",
      });
    }

    const statusBefore = escrow.status;

    escrow.status = "REFUNDED";
    escrow.refundTxHash = txHash;
    escrow.refundedAt = new Date();

    await escrow.save();

    createHistoryRecord({
      escrowId: escrow.escrowId,
      mongoEscrowId: String(escrow._id),
      txHash,
      action: "REFUND",
      actorWallet: escrow.landlordWallet,
      role: "landlord",
      propertyName: escrow.propertyName,
      amount: escrow.depositAmount,
      currency: escrow.currency,
      network: escrow.blockchainNetwork,
      contractId: escrow.contractId,
      statusBefore,
      statusAfter: "REFUNDED",
    }).catch((err) =>
      console.error("History record error (refundEscrow):", err.message)
    );

    return res.status(200).json({
      success: true,
      message: "Escrow refunded successfully",
      escrow,
    });
  } catch (error) {
    console.error("Refund Escrow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── Cancel Escrow ────────────────────────────────────────────────────────────
exports.cancelEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let escrow;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({ escrowId: Number(id) });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // ── Ownership check ──
    // Either party can request a cancellation, but only if they're actually
    // the student or landlord recorded on THIS escrow.
    if (req.user.role !== "admin") {
      const requesterWallet = await getRequesterWallet(req.user.id);
      const isStudentOnThisEscrow = walletsMatch(requesterWallet, escrow.studentWallet);
      const isLandlordOnThisEscrow = walletsMatch(requesterWallet, escrow.landlordWallet);
      if (!isStudentOnThisEscrow && !isLandlordOnThisEscrow) {
        return res.status(403).json({
          success: false,
          message: "You are not a party to this escrow",
        });
      }
    }

    if (escrow.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is already cancelled",
      });
    }

    if (escrow.status === "RELEASED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a released escrow",
      });
    }

    const statusBefore = escrow.status;
    escrow.status = "CANCELLED";
    if (reason) escrow.cancelReason = reason;
    escrow.cancelledAt = new Date();

    await escrow.save();

    res.status(200).json({
      success: true,
      message: "Escrow cancelled successfully",
      escrow,
    });
  } catch (error) {
    console.error("Cancel Escrow Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};