/**
 * Detects social media platform from URL.
 * Returns a normalized platform string.
 */
function detectPlatform(url = "") {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("reddit.com")) return "reddit";
  if (lower.includes("linkedin.com")) return "linkedin";
  return "generic";
}

/**
 * Validates if a string is a properly-formed URL.
 */
function isValidUrl(str = "") {
  try {
    const url = new URL(str.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts the first URL found in a text message.
 */
function extractUrl(text = "") {
  const urlRegex = /https?:\/\/[^\s]+/i;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

module.exports = { detectPlatform, isValidUrl, extractUrl };
