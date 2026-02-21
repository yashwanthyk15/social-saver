const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeContent = async (text) => {
  try {
    if (!text || text.trim().length < 5) {
      return {
        category: "Uncategorized",
        summary: "Content description not sufficient for AI analysis."
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are an advanced content intelligence engine for a personal knowledge storage system.

Analyze the following content deeply.

Rules:
1. Understand sarcasm, irony, memes, exaggeration.
2. Detect real meaning behind humor or satire.
3. Use global context if implied.
4. Assign ONE accurate category.
5. Generate ONE clear English sentence summary.

Category rules:
• If it clearly fits one of these, use EXACTLY one:
  Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment

• Otherwise:
  - Create a short meaningful category (max 2 words)
  - Do NOT use vague labels like Other or Misc

Return ONLY valid JSON.
No markdown.
No explanation.
No extra text.

Format:
{
  "category": "CategoryName",
  "summary": "One clear sentence summarizing the real meaning."
}

Content:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    const cleanText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanText);

      if (!parsed.category || !parsed.summary) {
        throw new Error("Missing required fields");
      }

      return parsed;

    } catch (parseError) {
      console.error("⚠️ Gemini returned invalid JSON:", cleanText);

      return {
        category: "Uncategorized",
        summary: "AI response formatting issue."
      };
    }

  } catch (error) {
    console.error("❌ Gemini FULL ERROR:", error);

    return {
      category: "AI Error",
      summary: "AI service temporarily unavailable."
    };
  }
};

module.exports = analyzeContent;