const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const telegramRoutes = require("./routes/telegram");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ── Security Headers ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images from other origins
}));

// ── CORS ──
// In dev, allow localhost on any port. In prod, restrict to FRONTEND_URL.
const getAllowedOrigins = () => {
  const frontend = process.env.FRONTEND_URL;
  if (process.env.NODE_ENV === "production" && frontend) {
    return [frontend];
  }
  // Development: allow all localhost origins
  return [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    ...(frontend ? [frontend] : []),
  ];
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      const allowed = getAllowedOrigins();
      if (allowed.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body Parsers ──
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Rate Limiting for Dashboard API ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ──
// Telegram webhook must NOT be rate-limited (Telegram retries aggressively)
app.use("/telegram", telegramRoutes);
app.use("/dashboard", apiLimiter, dashboardRoutes);

// ── Health Check ──
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  if (err.message?.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
