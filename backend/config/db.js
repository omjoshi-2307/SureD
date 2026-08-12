const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/depositsafe";
    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;