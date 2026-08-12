const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "landlord", "admin"],
      required: true,
    },

    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    walletAddress: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    isWalletConnected: {
      type: Boolean,
      default: false,
    },

    walletType: {
      type: String,
      default: "",
    },

    network: {
      type: String,
      default: "Testnet",
    },

    emailVerified: {
      type: Boolean,
      default: true,
    },

    walletVerified: {
      type: Boolean,
      default: false,
    },

    kycStatus: {
      type: String,
      default: "Pending",
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    theme: {
      type: String,
      default: "system",
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    language: {
      type: String,
      default: "English",
    },

    privacyPreferences: {
      type: String,
      default: "Standard",
    },

    resetPasswordOtp: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User",UserSchema);