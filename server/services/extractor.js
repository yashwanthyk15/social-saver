const axios = require("axios");

const extractMetadata = async (url) => {
  try {
    const response = await axios.get(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
      {
        timeout: 10000
      }
    );

    const data = response.data.data;

    return {
      title: data.title || null,
      description: data.description || null,
      image: data.image?.url || null
    };

  } catch (error) {
    console.error("Metadata extraction failed:", error.message);

    return {
      title: null,
      description: null,
      image: null
    };
  }
};

module.exports = extractMetadata;
