const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeContent = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash"
    });

   const prompt = `
You are an intelligent content classification engine for a personal knowledge storage system.

Your task:

1. Analyze the content.
2. Assign ONE category.
3. Generate a one sentence summary.

Category Rules:

• If the content clearly fits into one of these common themes, use EXACTLY one of them:
  Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment

• If it does NOT fit clearly into the above list:
  - Create a SHORT custom category (maximum 2 words).
  - The category must be clear and meaningful.
  - Do NOT create vague categories like "Other", "Misc", "General".
  - Examples of good dynamic categories:
      Comedy
      Anime
      Technology
      Cooking Tips
      Personal Growth
      Startup Advice
      Stock Market

Formatting Rules:

• Return ONLY valid JSON.
• Do NOT wrap output in markdown.
• Do NOT explain anything.
• Do NOT add extra text.

Required JSON format:

{
  "category": "CategoryName",
  "summary": "One clear and concise sentence summary."
}

Content:
${text}
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean possible markdown wrapping
    const cleanText = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini analysis failed:", error.message);
    return {
      category: "Other",
      summary: "Could not analyze content."
    };
  }
};

module.exports = analyzeContent;
