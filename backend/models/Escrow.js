const mongoose = require("mongoose");

const EscrowSchema = new mongoose.Schema(
  {
    escrowId: {
      type: Number,
      required: false,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    studentWallet: {
      type: String,
      required: true,
    },
    landlordWallet: {
      type: String,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    propertyAddress: {
      type: String,
      required: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "XLM",
    },
    rentalStartDate: {
      type: Date,
      required: true,
    },
    rentalEndDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    contractId: {
      type: String,
      required: true,
    },
    blockchainNetwork: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["CREATED", "FUNDED", "PENDING_CONFIRMATION", "RELEASED", "DISPUTED", "CANCELLED"],
      default: "CREATED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Escrow", EscrowSchema);
