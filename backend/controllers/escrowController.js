const Escrow = require("../models/Escrow");

// Create Escrow
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

// Get Escrow by ID (MongoDB _id or contract escrowId)
exports.getEscrowById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let escrow;
    // Check if valid ObjectId string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }
    
    // If not found by mongoId, check if it's a numeric escrowId
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

// Get Escrows by Student Wallet
exports.getEscrowsByStudent = async (req, res) => {
  try {
    const { wallet } = req.params;
    
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
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

// Get Escrows by Landlord Wallet
exports.getEscrowsByLandlord = async (req, res) => {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    const escrows = await Escrow.find({ landlordWallet: wallet });

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
// Release Escrow
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

    // Try MongoDB ObjectId first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    // Otherwise treat it as contract escrowId
    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({
        escrowId: Number(id),
      });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // Prevent releasing twice
    if (escrow.status === "RELEASED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is already released",
      });
    }

    // Optional safety check
    if (escrow.status !== "PENDING_CONFIRMATION") {
      return res.status(400).json({
        success: false,
        message: "Escrow is not ready for release",
      });
    }

    escrow.status = "RELEASED";
    escrow.releasedTxHash = txHash;
    escrow.releasedAt = new Date();

    await escrow.save();

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

// Fund Escrow
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

    // Try MongoDB ObjectId first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id);
    }

    // Otherwise treat it as contract escrowId
    if (!escrow && !isNaN(Number(id))) {
      escrow = await Escrow.findOne({
        escrowId: Number(id),
      });
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    if (escrow.status !== "CREATED") {
      return res.status(400).json({
        success: false,
        message: "Escrow is already funded or cannot be funded",
      });
    }

    escrow.status = "FUNDED";
    escrow.fundedTxHash = txHash;
    escrow.fundedAt = new Date();

    await escrow.save();

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