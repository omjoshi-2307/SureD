const User = require("../models/User");
const Escrow = require("../models/Escrow");
const TransactionHistory = require("../models/TransactionHistory");

const buildActivity = (history) => {
  if (!history || history.length === 0) {
    return [];
  }

  return history.slice(0, 8).map((entry) => ({
    id: entry._id.toString(),
    title: entry.action || "Account Activity",
    timestamp: entry.createdAt,
    status: entry.statusAfter || "Completed",
    transactionLink: entry.txHash ? `https://stellar.expert/explorer/testnet/tx/${entry.txHash}` : undefined,
    icon: entry.action === "CREATED" ? "🛡️" : entry.action === "FUNDED" ? "💰" : entry.action === "RELEASED" ? "✅" : entry.action === "DISPUTED" ? "⚠️" : "🔗",
  }));
};

// Get landlord wallet address (accessible by any authenticated user)
exports.getLandlordWallet = async (req, res) => {
  try {
    const walletAddress = process.env.LANDLORD_WALLET_ADDRESS;
    if (!walletAddress) {
      return res.status(500).json({
        success: false,
        message: "LANDLORD_WALLET_ADDRESS not configured in backend .env",
      });
    }
    console.log("Landlord wallet retrieved:", walletAddress);
    res.status(200).json({
      success: true,
      walletAddress,
    });
  } catch (error) {
    console.error("Get Landlord Wallet Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wallet = user.walletAddress || "";
    const escrows = wallet
      ? await Escrow.find({
          $or: [{ studentWallet: wallet }, { landlordWallet: wallet }],
        }).sort({ createdAt: -1 })
      : [];

    const history = wallet
      ? await TransactionHistory.find({ actorWallet: wallet }).sort({ createdAt: -1 }).limit(8)
      : [];

    const completedEscrows = escrows.filter((escrow) => escrow.status === "RELEASED").length;
    const pendingEscrows = escrows.filter((escrow) => ["CREATED", "FUNDED", "PENDING_CONFIRMATION"].includes(escrow.status)).length;
    const totalDepositValue = escrows.reduce((sum, escrow) => sum + Number(escrow.depositAmount || 0), 0);
    const totalReleasedValue = escrows
      .filter((escrow) => escrow.status === "RELEASED")
      .reduce((sum, escrow) => sum + Number(escrow.depositAmount || 0), 0);
    const successRate = escrows.length > 0 ? Math.round((completedEscrows / escrows.length) * 100) : 0;

    let averageCompletionTime = "N/A";
    if (completedEscrows > 0) {
      const completedEscrowsWithDates = escrows.filter((escrow) => escrow.status === "RELEASED" && escrow.releasedAt);
      if (completedEscrowsWithDates.length > 0) {
        const totalHours = completedEscrowsWithDates.reduce((sum, escrow) => {
          const createdAt = escrow.createdAt ? new Date(escrow.createdAt).getTime() : 0;
          const releasedAt = new Date(escrow.releasedAt).getTime();
          return sum + Math.max(0, Math.round((releasedAt - createdAt) / (1000 * 60 * 60)));
        }, 0);
        averageCompletionTime = `${Math.round(totalHours / completedEscrowsWithDates.length)}h`;
      }
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        id: user._id.toString(),
      },
      stats: {
        escrowsCreated: escrows.length,
        escrowsCompleted: completedEscrows,
        escrowsPending: pendingEscrows,
        totalDepositValue,
        totalReleased: totalReleasedValue,
        successRate,
        averageCompletionTime,
        lastTransactionDate: history[0]?.createdAt || escrows[0]?.createdAt || user.createdAt,
      },
      activity: buildActivity(history),
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.fullName !== undefined) {
      updateData.name = req.body.fullName;
    }

    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }

    if (req.body.username !== undefined) {
      updateData.username = req.body.username;
    }

    if (req.body.bio !== undefined) {
      updateData.bio = req.body.bio;
    }

    if (req.body.phone !== undefined) {
      updateData.phone = req.body.phone;
    }

    if (req.body.location !== undefined) {
      updateData.location = req.body.location;
    }

    if (req.body.profilePicture !== undefined) {
      updateData.profilePicture = req.body.profilePicture;
    }

    if (req.body.theme !== undefined) {
      updateData.theme = req.body.theme;
    }

    if (req.body.notifications !== undefined) {
      updateData.notifications = Boolean(req.body.notifications);
    }

    if (req.body.language !== undefined) {
      updateData.language = req.body.language;
    }

    if (req.body.privacyPreferences !== undefined) {
      updateData.privacyPreferences = req.body.privacyPreferences;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...user.toObject(),
        id: user._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Wallet Address
exports.updateWallet = async (req, res) => {
  try {
    const { walletAddress, isWalletConnected, walletType, network, walletVerified } = req.body;

    const updateData = {};

    if (walletAddress !== undefined) {
      updateData.walletAddress = walletAddress;
    }

    if (isWalletConnected !== undefined) {
      updateData.isWalletConnected = Boolean(isWalletConnected);
    }

    if (walletType !== undefined) {
      updateData.walletType = walletType;
    }

    if (network !== undefined) {
      updateData.network = network;
    }

    if (walletVerified !== undefined) {
      updateData.walletVerified = Boolean(walletVerified);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No wallet fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wallet updated successfully",
      user: {
        ...user.toObject(),
        id: user._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update Wallet Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};