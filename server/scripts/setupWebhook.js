require('dotenv').config();
const axios = require('axios');

async function setupWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!token) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
  }

  if (!webhookUrl) {
    console.error('❌ Error: WEBHOOK_URL is missing in .env (e.g. https://your-server.com/telegram)');
    process.exit(1);
  }

  try {
    console.log(`Setting webhook to: ${webhookUrl}`);
    const response = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
      url: webhookUrl,
    });
    console.log('✅ Success:', response.data.description);
  } catch (error) {
    console.error('❌ Failed to set webhook:');
    console.error(error.response?.data || error.message);
  }
}

setupWebhook();
