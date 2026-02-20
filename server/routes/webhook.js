const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const { detectPlatform } = require("../utils/platformDetector");
const extractMetadata = require("../services/extractor");
const analyzeContent = require("../services/aiService");
const twilio = require("twilio");

router.post("/", async (req, res) => {
  try {
    const incomingMsg = req.body.Body;
    const userPhone = req.body.From;

    if (!incomingMsg || !incomingMsg.includes("http")) {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message("⚠️ Please send a valid link.");
      res.writeHead(200, { "Content-Type": "text/xml" });
      return res.end(twiml.toString());
    }

    const platform = detectPlatform(incomingMsg);

    // 1️⃣ Extract Metadata
    const metadata = await extractMetadata(incomingMsg);
    const captionText =
      metadata?.description ||
      metadata?.title ||
      "No description available.";

    // 2️⃣ Gemini AI Analysis
    const aiResult = await analyzeContent(captionText);

        // Check duplicate
const existing = await Content.findOne({
  userPhone,
  url: incomingMsg
});

if (existing) {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("⚠️ This link is already saved.");
  res.writeHead(200, { "Content-Type": "text/xml" });
  return res.end(twiml.toString());
}

    // 3️⃣ Save to Database
    const newContent = new Content({
  userPhone,
  url: incomingMsg,
  platform,
  caption: captionText,
  aiSummary: aiResult.summary,
  category: aiResult.category,
  image: metadata?.image
});



    await newContent.save();

    // 4️⃣ Smart WhatsApp Reply
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      `✅ Saved to *${aiResult.category}* bucket.\n\n📝 ${aiResult.summary}`
    );

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());

  } catch (error) {
    console.error("Webhook error:", error.message);

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("❌ Something went wrong while processing the link.");

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  }
});

module.exports = router;
