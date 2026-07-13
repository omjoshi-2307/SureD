const User = require("../models/User");

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

// Update Wallet Address
exports.updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wallet address updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Wallet Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};