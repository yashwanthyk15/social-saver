const { GoogleGenerativeAI } = require("@google/generative-ai");

const FALLBACK = {
  category: "Uncategorized",
  summary: "Could not analyze this content.",
  tags: [],
};

/**
 * Analyzes content text using Gemini Flash and returns
 * { category, summary, tags }
 */
const analyzeContent = async (text) => {
  if (!text || text.trim().length < 10) {
    return FALLBACK;
  }

  try {
    // Instantiate here so the API key is definitely loaded from .env
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert content intelligence engine for a personal knowledge base.

Analyze the following content and extract its meaning. Be concise and accurate.

Rules:
1. CATEGORY: Assign ONE category. Use one of these if it fits exactly:
   Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment, Science, Health, Art, Sports, Gaming, Productivity
   If none fits, create a short 1-2 word custom category. Never use "Other" or "Misc".

2. SUMMARY: Write ONE clear English sentence that captures the main idea. Be specific and informative, not vague.

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
    console.error("❌ AI Analysis Error:", error.message);
    return FALLBACK;
  }
};

module.exports = analyzeContent;
