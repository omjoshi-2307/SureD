const TransactionHistory = require("../models/TransactionHistory");
const Escrow = require("../models/Escrow");

// ─── Helper: create one history record (deduplicates by txHash) ──────────────
exports.createHistoryRecord = async ({
  escrowId,
  mongoEscrowId,
  txHash,
  action,
  actorWallet,
  role,
  propertyName,
  amount,
  currency,
  network,
  contractId,
  statusBefore,
  statusAfter,
}) => {
  try {
    // Deduplicate by txHash — same hash = same on-chain event
    const existing = await TransactionHistory.findOne({ txHash });
    if (existing) return existing;

    const record = new TransactionHistory({
      escrowId: escrowId !== undefined ? Number(escrowId) : undefined,
      mongoEscrowId: mongoEscrowId ? String(mongoEscrowId) : undefined,
      txHash,
      action,
      actorWallet,
      role: role || undefined,
      propertyName: propertyName || "",
      amount: amount !== undefined ? Number(amount) : undefined,
      currency: currency || "XLM",
      network: network || "Stellar Testnet",
      contractId: contractId || undefined,
      statusBefore: statusBefore || undefined,
      statusAfter: statusAfter || undefined,
    });

    await record.save();
    return record;
  } catch (error) {
    // Log but never crash the caller — history is secondary to the main flow
    console.error("Create History Record Error:", error.message);
    return null;
  }
};

// ─── GET /escrow/:escrowId ────────────────────────────────────────────────────
exports.getHistoryByEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    if (isNaN(Number(escrowId))) {
      return res.status(400).json({ success: false, message: "Invalid Escrow ID." });
    }

    const { sort = "newest", page = 1, limit = 20 } = req.query;
    const sortDir = sort === "oldest" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const [history, total] = await Promise.all([
      TransactionHistory.find({ escrowId: Number(escrowId) })
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit)),
      TransactionHistory.countDocuments({ escrowId: Number(escrowId) }),
    ]);

    res.status(200).json({ success: true, history, total, page: Number(page) });
  } catch (error) {
    console.error("Get History By Escrow Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── GET /student/:wallet ─────────────────────────────────────────────────────
exports.getHistoryByStudent = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "Wallet address is required." });
    }

    const { sort = "newest", page = 1, limit = 20, type } = req.query;
    const sortDir = sort === "oldest" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    // Find all escrows where student is studentWallet
    const escrows = await Escrow.find({ studentWallet: wallet });
    if (escrows.length === 0) {
      return res.status(200).json({ success: true, history: [], total: 0, page: Number(page) });
    }

    const escrowMongoIds = escrows.map(e => String(e._id));
    const escrowNumericIds = escrows.map(e => e.escrowId).filter(id => id !== undefined && id !== null);

    const query = {
      $or: [
        { mongoEscrowId: { $in: escrowMongoIds } },
        { escrowId: { $in: escrowNumericIds } }
      ]
    };
    if (type && type !== "All") query.action = type;

    const [history, total] = await Promise.all([
      TransactionHistory.find(query)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit)),
      TransactionHistory.countDocuments(query),
    ]);

    res.status(200).json({ success: true, history, total, page: Number(page) });
  } catch (error) {
    console.error("Get History By Student Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── GET /landlord/:wallet ────────────────────────────────────────────────────
exports.getHistoryByLandlord = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "Wallet address is required." });
    }

    const { sort = "newest", page = 1, limit = 20, type } = req.query;
    const sortDir = sort === "oldest" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    // Find all escrows where landlord is landlordWallet
    const escrows = await Escrow.find({ landlordWallet: wallet });
    if (escrows.length === 0) {
      return res.status(200).json({ success: true, history: [], total: 0, page: Number(page) });
    }

    const escrowMongoIds = escrows.map(e => String(e._id));
    const escrowNumericIds = escrows.map(e => e.escrowId).filter(id => id !== undefined && id !== null);

    const query = {
      $or: [
        { mongoEscrowId: { $in: escrowMongoIds } },
        { escrowId: { $in: escrowNumericIds } }
      ]
    };
    if (type && type !== "All") query.action = type;

    const [history, total] = await Promise.all([
      TransactionHistory.find(query)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit)),
      TransactionHistory.countDocuments(query),
    ]);

    res.status(200).json({ success: true, history, total, page: Number(page) });
  } catch (error) {
    console.error("Get History By Landlord Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── GET /wallet/:wallet  (role-agnostic, used by the frontend) ───────────────
exports.getHistoryByWallet = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "Wallet address is required." });
    }

    const { sort = "newest", page = 1, limit = 20, type } = req.query;
    const sortDir = sort === "oldest" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    // Determine ownership query based on req.user.role
    const escrowQuery = {};
    if (req.user && req.user.role === "landlord") {
      escrowQuery.landlordWallet = wallet;
    } else {
      escrowQuery.studentWallet = wallet;
    }

    const escrows = await Escrow.find(escrowQuery);
    if (escrows.length === 0) {
      return res.status(200).json({ success: true, history: [], total: 0, page: Number(page) });
    }

    const escrowMongoIds = escrows.map(e => String(e._id));
    const escrowNumericIds = escrows.map(e => e.escrowId).filter(id => id !== undefined && id !== null);

    const query = {
      $or: [
        { mongoEscrowId: { $in: escrowMongoIds } },
        { escrowId: { $in: escrowNumericIds } }
      ]
    };
    if (type && type !== "All") query.action = type;

    const [history, total] = await Promise.all([
      TransactionHistory.find(query)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit)),
      TransactionHistory.countDocuments(query),
    ]);

    res.status(200).json({ success: true, history, total, page: Number(page) });
  } catch (error) {
    console.error("Get History By Wallet Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
