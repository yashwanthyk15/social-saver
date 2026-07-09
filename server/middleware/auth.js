const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userPhone = decoded.userPhone;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        error: "Session expired. Please type /start in Telegram to get a new link.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(403).json({
      error: "Invalid session token.",
      code: "TOKEN_INVALID",
    });
  }
};

module.exports = authMiddleware;
