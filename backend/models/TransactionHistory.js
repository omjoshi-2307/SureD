const mongoose = require("mongoose");

const TransactionHistorySchema = new mongoose.Schema(
  {
    escrowId: {
      type: Number,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'CREATED', 'FUNDED', 'CONFIRMED'
    },
    actorWallet: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    contractId: {
      type: String,
      required: true,
    },
    statusBefore: {
      type: String,
      required: true,
    },
    statusAfter: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  }
);

module.exports = mongoose.model("TransactionHistory", TransactionHistorySchema);
