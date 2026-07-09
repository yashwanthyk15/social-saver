const axios = require("axios");

/**
 * Fetches metadata for a URL using Microlink API.
 * Returns title, description, and image.
 * Falls back to empty values on failure.
 */
const extractMetadata = async (url) => {
  try {
    const response = await axios.get(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&video=false`,
      { timeout: 12000 }
    );

    const data = response.data?.data;

    if (!data) {
      return { title: null, description: null, image: null };
    }

    return {
      title: data.title || null,
      description: data.description || null,
      image: data.image?.url || data.logo?.url || null,
    };
  } catch (error) {
    console.error("⚠️ Metadata extraction failed:", error.message);
    return { title: null, description: null, image: null };
  }
};

module.exports = extractMetadata;
