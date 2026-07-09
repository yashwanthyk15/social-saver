require('dotenv').config();
const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/telegram';

if (!TELEGRAM_TOKEN) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

console.log("🔄 Starting local Telegram polling...");
console.log(`📡 Forwarding updates to ${LOCAL_WEBHOOK_URL}`);

let offset = 0;

async function poll() {
  try {
    const res = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates`, {
      params: { offset, timeout: 30 }
    });

    const updates = res.data.result;
    
    for (const update of updates) {
      offset = update.update_id + 1;
      
      try {
        // Forward the exact update payload to our Express webhook route
        await axios.post(LOCAL_WEBHOOK_URL, update);
        console.log(`✅ Forwarded update ${update.update_id}`);
      } catch (err) {
        console.error(`❌ Failed to forward update ${update.update_id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("❌ Polling error:", error.message);
  } finally {
    // Poll again immediately after the previous request finishes
    setTimeout(poll, 1000);
  }
}

// Clear any existing webhook so getUpdates can work
axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteWebhook`)
  .then(() => poll())
  .catch(err => {
    console.error("❌ Failed to delete webhook:", err.message);
    poll();
  });
