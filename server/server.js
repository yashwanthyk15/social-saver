require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
});

const start = async () => {
  // Pre-flight checks
  if (!process.env.TELEGRAM_BOT_TOKEN) console.warn('⚠️ WARNING: TELEGRAM_BOT_TOKEN is missing');
  if (!process.env.GEMINI_API_KEY) console.warn('⚠️ WARNING: GEMINI_API_KEY is missing');
  if (!process.env.JWT_SECRET) console.warn('⚠️ WARNING: JWT_SECRET is missing');

  try {
    await connectDB();
    await require('./models/Content').syncIndexes();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

start();
