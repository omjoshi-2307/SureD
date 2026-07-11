const TransactionHistory = require("../models/TransactionHistory");

// Get history by Escrow ID
exports.getHistoryByEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    if (isNaN(Number(escrowId))) {
      return res.status(400).json({ success: false, message: "Invalid Escrow ID." });
    }
    const history = await TransactionHistory.find({ escrowId: Number(escrowId) })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get History By Escrow Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get history by Student Wallet
exports.getHistoryByStudent = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "Wallet address is required." });
    }
    const history = await TransactionHistory.find({ actorWallet: wallet })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get History By Student Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get history by Landlord Wallet
exports.getHistoryByLandlord = async (req, res) => {
  try {
    const { wallet } = req.params;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "Wallet address is required." });
    }
    const history = await TransactionHistory.find({ actorWallet: wallet })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get History By Landlord Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Helper function to create a history record
exports.createHistoryRecord = async ({
  escrowId,
  txHash,
  action,
  actorWallet,
  network,
  contractId,
  statusBefore,
  statusAfter,
}) => {
  try {
    // Check if record already exists to avoid duplicates
    const existing = await TransactionHistory.findOne({ txHash });
    if (existing) return existing;

    const record = new TransactionHistory({
      escrowId: Number(escrowId),
      txHash,
      action,
      actorWallet,
      network: network || "Stellar Testnet",
      contractId,
      statusBefore,
      statusAfter,
    });
    await record.save();
    return record;
  } catch (error) {
    console.error("Create History Record Error:", error);
    throw error;
  }
};
