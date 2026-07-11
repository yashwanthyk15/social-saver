const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const { detectPlatform, isValidUrl, extractUrl } = require("../utils/platformDetector");
const extractMetadata = require("../services/extractor");
const { analyzeContent } = require("../services/aiService");
const { sendMessage, sendTyping } = require("../services/telegramService");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateToken(chatId) {
  return jwt.sign(
    { userPhone: chatId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getDashboardLink(chatId) {
  const token = generateToken(chatId);
  const baseUrl = FRONTEND_URL.endsWith('/') ? FRONTEND_URL.slice(0, -1) : FRONTEND_URL;
  return `${baseUrl}/?token=${token}`;
}

// ─────────────────────────────────────────────
// Command Handlers
// ─────────────────────────────────────────────

async function handleStart(chatId) {
  const dashboardUrl = getDashboardLink(chatId);
  await sendMessage(
    chatId,
    `👋 <b>Welcome to Social Saver!</b>

I'm your AI-powered personal knowledge base. Send me any link and I'll:
  📥 Extract the content
  🧠 Analyze &amp; summarize it with AI
  🏷 Categorize it automatically
  📊 Save it to your personal dashboard

<b>Supported platforms:</b>
  • Instagram Reels &amp; posts
  • Twitter / X threads
  • YouTube videos
  • Reddit posts
  • LinkedIn articles
  • Any blog or website URL

<b>Commands:</b>
  /start — Get your dashboard link
  /stats — See your saved content stats
  /help — Show all commands

🔐 <b>Your private dashboard (valid 7 days):</b>
<a href="${dashboardUrl}">${dashboardUrl}</a>

📌 <i>Tip: Pin this message for quick access.</i>
⚠️ After 7 days, type /start to get a fresh link.`
  );
}

async function handleStats(chatId) {
  try {
    const total = await Content.countDocuments({ userPhone: chatId.toString() });
    const favorites = await Content.countDocuments({
      userPhone: chatId.toString(),
      isFavorite: true,
    });
    const categories = await Content.distinct("category", {
      userPhone: chatId.toString(),
    });
    const platforms = await Content.aggregate([
      { $match: { userPhone: chatId.toString() } },
      { $group: { _id: "$platform", count: { $sum: 1 } } },
    ]);

    const platformLines = platforms
      .map((p) => `  • ${p._id}: ${p.count}`)
      .join("\n");

    await sendMessage(
      chatId,
      `📊 <b>Your Social Saver Stats</b>

📚 Total saved: <b>${total}</b>
⭐ Favorites: <b>${favorites}</b>
🗂 Categories: <b>${categories.length}</b>

<b>By Platform:</b>
${platformLines || "  No data yet"}

Visit your dashboard for full details!`
    );
  } catch (error) {
    console.error("Stats error:", error.message);
    await sendMessage(chatId, "❌ Could not fetch stats. Please try again.");
  }
}

async function handleHelp(chatId) {
  await sendMessage(
    chatId,
    `🤖 <b>Social Saver — Help</b>

<b>Commands:</b>
  /start — Get your private dashboard link
  /stats — View your saved content stats
  /help  — Show this help message

<b>How to save content:</b>
  Just paste any URL into this chat!

<b>Dashboard features:</b>
  🔎 Search across all your saved content
  🗂 Filter by category or platform
  ⭐ Mark favorites
  📝 Add personal notes
  🎲 Discover random saved content
  🗑 Delete individual items

<b>Tips:</b>
  • You can send multiple links (one at a time)
  • Duplicate links are automatically detected
  • Your data is private and isolated per user`
  );
}

// ─────────────────────────────────────────────
// Main Webhook Handler
// ─────────────────────────────────────────────

router.post("/", async (req, res) => {
  // Always respond immediately to Telegram
  res.sendStatus(200);

  try {
    const message = req.body.message || req.body.edited_message;

    // Support text messages OR media with captions (e.g. sharing from other apps)
    const textContent = message?.text || message?.caption;
    if (!textContent) return;

    const incomingMsg = textContent.trim();
    const chatId = message.chat.id;

    // ── Commands ──
    if (incomingMsg === "/start") return await handleStart(chatId);
    if (incomingMsg === "/stats") return await handleStats(chatId);
    if (incomingMsg === "/help") return await handleHelp(chatId);

    // ── Link Detection ──
    const url = extractUrl(incomingMsg);

    if (!url || !isValidUrl(url)) {
      return await sendMessage(
        chatId,
        `⚠️ That doesn't look like a valid link.

Please send a URL starting with <code>https://</code>

Or use a command:
  /start — dashboard link
  /help  — all commands`
      );
    }

    // ── Duplicate Check ──
    const existing = await Content.findOne({
      userPhone: chatId.toString(),
      url: url,
    });

    if (existing) {
      return await sendMessage(
        chatId,
        `⚠️ <b>Already saved!</b>

This link is already in your collection under <b>${existing.category}</b>.

Visit your dashboard to find it.`
      );
    }

    // ── Show typing indicator ──
    await sendTyping(chatId);

    // ── Extract metadata ──
    const metadata = await extractMetadata(url);
    const captionText =
      metadata?.description || metadata?.title || "No description available.";

    // ── AI Analysis ──
    const aiResult = await analyzeContent(captionText);

    // ── Platform Detection ──
    const platform = detectPlatform(url);

    // ── Save to DB ──
    const newContent = new Content({
      userPhone: chatId.toString(),
      url,
      platform,
      caption: captionText,
      aiSummary: aiResult.summary,
      category: aiResult.category,
      tags: aiResult.tags || [],
      image: metadata?.image || null,
    });

    await newContent.save();

    // ── Smart Reply ──
    const tagLine =
      aiResult.tags?.length > 0
        ? `\n🏷 <b>Tags:</b> ${aiResult.tags.map((t) => `#${t}`).join(" ")}`
        : "";

    await sendMessage(
      chatId,
      `✅ <b>Saved successfully!</b>

📂 <b>Category:</b> ${aiResult.category}
📝 <b>Summary:</b> ${aiResult.summary}${tagLine}

Open your dashboard to view &amp; manage your collection.`
    );
  } catch (error) {
    console.error("❌ Telegram webhook error:", error.message);
    const chatId = req.body?.message?.chat?.id || req.body?.edited_message?.chat?.id;
    if (chatId) {
      try {
        const { sendMessage } = require("../services/telegramService");
        await sendMessage(chatId, "❌ An internal error occurred while processing this link. Our AI might be temporarily overloaded. Please try again later.");
      } catch (e) {}
    }
  }
});

module.exports = router;
