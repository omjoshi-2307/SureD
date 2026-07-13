const mongoose = require("mongoose");

const TransactionHistorySchema = new mongoose.Schema(
  {
    // Numeric on-chain escrow ID (may be undefined for very old records)
    escrowId: {
      type: Number,
      required: false,
    },

    // MongoDB _id of the parent Escrow document (string form for flexibility)
    mongoEscrowId: {
      type: String,
      required: false,
    },

    // Blockchain transaction hash — unique per record
    txHash: {
      type: String,
      required: true,
      unique: true,
    },

    // Human-readable action type
    // ESCROW_CREATED | DEPOSIT | STUDENT_CONFIRM | LANDLORD_CONFIRM | RELEASE | REFUND | DISPUTE_RAISED | DISPUTE_RESOLVED | CANCELLED
    action: {
      type: String,
      required: true,
    },

    // Wallet address of the actor who triggered this transaction
    actorWallet: {
      type: String,
      required: true,
    },

    // Role of the actor
    role: {
      type: String,
      enum: ["student", "landlord", "admin", "system"],
      required: false,
    },

    // Property name — denormalized for fast display
    propertyName: {
      type: String,
      required: false,
      default: "",
    },

    // Deposit amount at the time of the transaction
    amount: {
      type: Number,
      required: false,
    },

    // Currency (XLM, USDC, etc.)
    currency: {
      type: String,
      required: false,
      default: "XLM",
    },

    // Blockchain network label
    network: {
      type: String,
      required: true,
      default: "Stellar Testnet",
    },

    // Smart contract address
    contractId: {
      type: String,
      required: false,
    },

    // Escrow status before this action
    statusBefore: {
      type: String,
      required: false,
    },

    // Escrow status after this action
    statusAfter: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("TransactionHistory", TransactionHistorySchema);
