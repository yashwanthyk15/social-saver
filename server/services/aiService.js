const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeContent = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash"
    });
const prompt = `
You are an advanced content intelligence engine for a personal knowledge storage system.

Your job is to deeply understand social media content including tone, sarcasm, irony, cultural context, and references to current global events.

You must:

1. Analyze the content meaningfully.
2. Detect sarcasm, satire, irony, exaggeration, or meme-style humor.
3. Consider relevant global trends or current news if the content implies them.
4. Assign ONE accurate category.
5. Generate a one sentence summary.

Important Interpretation Rules:

• If the content is sarcastic, ironic, meme-based, or exaggerated:
  - Interpret the REAL meaning behind it.
  - Do NOT summarize literally.
  - Reflect the underlying intent in the summary.

• If the content references trends, politics, viral moments, or current global events:
  - Infer the contextual meaning using general world knowledge.

• If the original content is in a non-English language:
  - Translate its meaning internally.
  - Output summary ONLY in English.
  - Maintain tone alignment (e.g., comedic, dramatic, motivational).

• The summary must:
  - Be clear.
  - Be in English only.
  - Capture the real intention of the content.
  - Be a single concise sentence.

Category Rules:

• If the content clearly fits into one of these themes, use EXACTLY one:
  Fitness, Food, Coding, Travel, Business, Finance, Design, Education, Motivation, Entertainment

• If it does NOT clearly fit:
  - Create a SHORT meaningful category (max 2 words).
  - Must be specific.
  - Do NOT use vague categories like "Other", "Misc", "General".

Examples of strong dynamic categories:
  Comedy
  Anime
  Technology
  Cooking Tips
  Personal Growth
  Startup Advice
  Stock Market
  Political Satire
  Social Commentary
  Meme Culture

Formatting Rules:

• Return ONLY valid JSON.
• Do NOT wrap output in markdown.
• Do NOT explain anything.
• Do NOT add extra text.

Required JSON format:

{
  "category": "CategoryName",
  "summary": "One clear, accurate English sentence summarizing the true meaning."
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
