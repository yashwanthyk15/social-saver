const axios = require("axios");

/**
 * Fetches metadata for a URL using Microlink API.
 * Returns title, description, and image.
 * Falls back to empty values on failure.
 */
const extractMetadata = async (url) => {
  try {
    // ── YouTube Special Case using oEmbed ──
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const ytResponse = await axios.get(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
          { timeout: 8000 }
        );
        if (ytResponse.data) {
          return {
            title: ytResponse.data.title || null,
            description: `YouTube Video by ${ytResponse.data.author_name || 'Unknown'}`,
            image: ytResponse.data.thumbnail_url || null,
          };
        }
      } catch (ytError) {
        console.warn("YouTube oEmbed failed, falling back to microlink...");
      }
    }

    // ── Generic Fallback via Microlink ──
    const response = await axios.get(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&video=false`,
      { timeout: 12000 }
    );

    const data = response.data?.data;

    if (!data) {
      return { title: null, description: null, image: null };
    }

    let finalImageUrl = data.image?.url || data.logo?.url || null;
    let base64Image = null;

    if (finalImageUrl) {
      try {
        const imgRes = await axios.get(finalImageUrl, {
          responseType: "arraybuffer",
          timeout: 8000,
        });
        const contentType = imgRes.headers["content-type"] || "image/jpeg";
        const b64 = Buffer.from(imgRes.data, "binary").toString("base64");
        base64Image = `data:${contentType};base64,${b64}`;
      } catch (imgErr) {
        console.warn("⚠️ Failed to convert image to base64, falling back to URL");
        base64Image = finalImageUrl;
      }
    }

    return {
      title: data.title || null,
      description: data.description || null,
      image: base64Image,
    };
  } catch (error) {
    console.error("⚠️ Metadata extraction failed:", error.message);
    return { title: null, description: null, image: null };
  }
};

module.exports = extractMetadata;
