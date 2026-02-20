function detectPlatform(url) {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("http")) return "generic";
  return "unknown";
}

module.exports = { detectPlatform };