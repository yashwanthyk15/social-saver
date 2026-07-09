const axios = require("axios");

// ⚠️  Read token lazily (inside functions) so dotenv has time to load
const BASE = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Send a text message to a Telegram chat.
 * parseMode: "HTML" by default (supports <b>, <i>, <code>, <a href>)
 */
const sendMessage = async (chatId, text, parseMode = "HTML") => {
  try {
    await axios.post(`${BASE()}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error(
      "❌ Telegram sendMessage failed:",
      error.response?.data || error.message
    );
  }
};

/**
 * Show "typing..." indicator while the bot processes.
 */
const sendTyping = async (chatId) => {
  try {
    await axios.post(`${BASE()}/sendChatAction`, {
      chat_id: chatId,
      action: "typing",
    });
  } catch {
    // Non-critical — ignore silently
  }
};

module.exports = { sendMessage, sendTyping };
