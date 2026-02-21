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
      model: "gemini-2.5-flash"
    });

   const prompt = `
You are an advanced content intelligence engine for a personal knowledge storage system.

Analyze the following content carefully and understand its core meaning.

Rules:
1. Focus on the main idea or topic of the content.
2. Identify the central theme or purpose.
3. Assign ONE accurate category.
4. Generate ONE clear English sentence summary.

Category rules:
• If it clearly fits one of these, use EXACTLY one:
  Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment

• Otherwise:
  - Create a short meaningful category (max 2 words)
  - Do NOT use vague labels like Other or Misc

Summary rules:
• Must be in English.
• Must be one concise sentence.
• Must clearly describe the main meaning of the content.

Return ONLY valid JSON.
No markdown.
No explanation.
No extra text.

Format:
{
  "category": "CategoryName",
  "summary": "One clear sentence summarizing the content."
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