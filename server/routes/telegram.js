const express = require("express");
const router = express.Router();
const axios = require("axios");
const Content = require("../models/Content");
const { detectPlatform } = require("../utils/platformDetector");
const extractMetadata = require("../services/extractor");
const analyzeContent = require("../services/aiService");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

router.post("/", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const incomingMsg = message.text;
    const chatId = message.chat.id;

    // ❌ Not a link
    // Handle /start command
if (incomingMsg === "/start") {
  await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      chat_id: chatId,
      text: `👋 *Welcome to Social Saver!*

Send me:
• Instagram links  
• Twitter/X threads  
• Blog URLs  

I’ll automatically:
* Categorize the content  
* Generate a smart summary  
* Store it in your personal dashboard  

Just paste a link to begin 🚀`
    }
  );

  return res.sendStatus(200);
}

    // Detect platform
    const platform = detectPlatform(incomingMsg);

    // Check duplicate
    const existing = await Content.findOne({
      userPhone: chatId.toString(),
      url: incomingMsg
    });

    if (existing) {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: "⚠️ This link is already saved."
        }
      );

      return res.sendStatus(200);
    }

    // Extract metadata
    const metadata = await extractMetadata(incomingMsg);

    const captionText =
      metadata?.description ||
      metadata?.title ||
      "No description available.";

    // AI Analysis
    const aiResult = await analyzeContent(captionText);

    // Save to DB
    const newContent = new Content({
      userPhone: chatId.toString(),
      url: incomingMsg,
      platform,
      caption: captionText,
      aiSummary: aiResult.summary,
      category: aiResult.category,
      image: metadata?.image
    });

    await newContent.save();

    // ✅ Smart reply
    await axios.post(
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
  {
    chat_id: chatId,
    parse_mode: "Markdown",
    text: `✅ *Saved to ${aiResult.category}*

📝 ${aiResult.summary}

🔗 *View your dashboard:*
https://social-saver-yk.onrender.com/?user=${chatId}`
  }
);

    res.sendStatus(200);

  } catch (error) {
    console.error("Telegram error:", error.message);
    res.sendStatus(200);
  }
});

module.exports = router;