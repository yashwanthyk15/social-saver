require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  console.log("Attempting to connect to MongoDB...");
  try {
    mongoose.set('debug', true);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ SUCCESS");
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
