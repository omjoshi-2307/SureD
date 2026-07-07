const User = require("../models/User");

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