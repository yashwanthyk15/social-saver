const { GoogleGenerativeAI } = require("@google/generative-ai");

const FALLBACK = {
  category: "Uncategorized",
  summary: "Could not analyze this content.",
  tags: [],
};

// ── API Key Rotation Logic ──
// Support a comma-separated list of keys (GEMINI_API_KEYS) or a single key (GEMINI_API_KEY)
const getKeys = () => {
  if (process.env.GEMINI_API_KEYS) {
    return process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
  }
  if (process.env.GEMINI_API_KEY) {
    return [process.env.GEMINI_API_KEY.trim()];
  }
  return [];
};

let currentKeyIndex = 0;

const getNextAvailableKey = () => {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY provided in environment.");
  
  const key = keys[currentKeyIndex];
  // Rotate to the next key for the next failure
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  
  return key;
};

const getCurrentKey = () => {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY provided in environment.");
  return keys[currentKeyIndex];
};

/**
 * Analyzes content text using Gemini Flash and returns
 * { category, summary, tags }
 */
const analyzeContent = async (text) => {
  if (!text || text.trim().length < 10) {
    return FALLBACK;
  }

  const MAX_RETRIES = getKeys().length > 0 ? Math.max(3, getKeys().length + 1) : 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const apiKey = getCurrentKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert content intelligence engine for a personal knowledge base.

Analyze the following content and extract its meaning. Be concise and accurate.

Rules:
1. CATEGORY: Assign ONE category. Use one of these if it fits exactly:
   Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment, Science, Health, Art, Sports, Gaming, Productivity
   If none fits, create a short 1-2 word custom category. Never use "Other" or "Misc".

2. SUMMARY: Write a concise summary (max 2 short sentences). Keep it brief to fit nicely on a UI card.

3. TAGS: Generate 2-4 short relevant keyword tags (lowercase, no spaces, hyphens allowed). Example: ["machine-learning", "python", "tutorial"]

Return ONLY valid JSON. No markdown. No code blocks. No extra text.

Format:
{
  "category": "CategoryName",
  "summary": "One clear descriptive sentence.",
  "tags": ["tag1", "tag2", "tag3"]
}

Content:
${text.substring(0, 2000)}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(rawText);

      if (!parsed.category || !parsed.summary) {
        throw new Error("Missing required fields in AI response");
      }

      return {
        category: String(parsed.category).substring(0, 50),
        summary: String(parsed.summary).substring(0, 300),
        tags: Array.isArray(parsed.tags)
          ? parsed.tags
              .slice(0, 5)
              .map((t) => String(t).toLowerCase().replace(/\s+/g, "-").substring(0, 30))
          : [],
      };
    } catch (error) {
      attempt++;
      const isQuotaOrServer = error.message.includes("429") || error.message.includes("503") || error.message.includes("quota") || error.message.includes("exhausted");
      
      console.error(`❌ AI Analysis Error (Attempt ${attempt}):`, error.message);
      
      if (isQuotaOrServer && getKeys().length > 1) {
        console.log(`🔄 Rotating API Key (Switching to Key #${currentKeyIndex + 1})...`);
        getNextAvailableKey();
      } else if (attempt >= MAX_RETRIES) {
        return FALLBACK;
      }
      
      await new Promise(res => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
    }
  }
  return FALLBACK;
};

/**
 * RAG Chatbot function to answer questions based on the user's saved content.
 */
const answerQuestion = async (question, contextData) => {
  if (!question || !question.trim()) {
    return "Please ask a question.";
  }

  const MAX_RETRIES = getKeys().length > 0 ? Math.max(3, getKeys().length + 1) : 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const apiKey = getCurrentKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are the Social Saver Assistant, a helpful AI chatbot embedded in a user's dashboard.
Your job is to answer the user's questions based ONLY on the context of their saved bookmarks provided below. 
If the user asks something completely unrelated to their saved content or how to use the dashboard, politely refuse to answer and remind them that you are restricted to discussing their saved content. Be concise and friendly. Do not use markdown if possible, just plain text.

USER'S SAVED CONTENT:
${contextData}

USER'S QUESTION:
${question}`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      attempt++;
      const isQuotaOrServer = error.message.includes("429") || error.message.includes("503") || error.message.includes("quota") || error.message.includes("exhausted");
      
      console.error(`❌ AI Chatbot Error (Attempt ${attempt}):`, error.message);
      
      if (isQuotaOrServer && getKeys().length > 1) {
        console.log(`🔄 Rotating API Key (Switching to Key #${currentKeyIndex + 1})...`);
        getNextAvailableKey();
      } else if (attempt >= MAX_RETRIES) {
        return "I'm having trouble connecting to my brain right now. Please try again later.";
      }
      
      // Exponential backoff
      await new Promise(res => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
    }
  }
};

module.exports = { analyzeContent, answerQuestion };
