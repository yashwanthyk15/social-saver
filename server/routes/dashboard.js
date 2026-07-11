const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const authMiddleware = require("../middleware/auth");
const { answerQuestion } = require("../services/aiService");

// Apply auth to all dashboard routes
router.use(authMiddleware);

/* ================================
   Get All Content (with pagination)
================================ */
router.get("/all", async (req, res) => {
  try {
    const phone = req.userPhone;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Content.find({ userPhone: phone })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments({ userPhone: phone }),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch all error:", error.message);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

/* ================================
   Get Stats
================================ */
router.get("/stats", async (req, res) => {
  try {
    const phone = req.userPhone;

    const [total, favorites, categories, platforms] = await Promise.all([
      Content.countDocuments({ userPhone: phone }),
      Content.countDocuments({ userPhone: phone, isFavorite: true }),
      Content.distinct("category", { userPhone: phone }),
      Content.aggregate([
        { $match: { userPhone: phone } },
        { $group: { _id: "$platform", count: { $sum: 1 } } },
      ]),
    ]);

    // Top categories by count
    const categoryCounts = await Content.aggregate([
      { $match: { userPhone: phone } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total,
      favorites,
      totalCategories: categories.length,
      platforms,
      categoryCounts,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* ================================
   Get Categories
================================ */
router.get("/categories", async (req, res) => {
  try {
    const phone = req.userPhone;

    const categories = await Content.aggregate([
      { $match: { userPhone: phone, category: { $exists: true, $ne: null } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(categories.map((c) => ({ name: c._id, count: c.count })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/* ================================
   Search (Full-text + regex fallback)
================================ */
router.get("/search", async (req, res) => {
  try {
    const phone = req.userPhone;
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ data: [], total: 0 });
    }

    const sanitized = q.trim().substring(0, 100);

    const results = await Content.find({
      userPhone: phone,
      $or: [
        { aiSummary: { $regex: sanitized, $options: "i" } },
        { category: { $regex: sanitized, $options: "i" } },
        { caption: { $regex: sanitized, $options: "i" } },
        { tags: { $regex: sanitized, $options: "i" } },
        { userNote: { $regex: sanitized, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ data: results, total: results.length });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

/* ================================
   Filter by Category
================================ */
router.get("/category/:cat", async (req, res) => {
  try {
    const phone = req.userPhone;
    const cat = decodeURIComponent(req.params.cat);

    const data = await Content.find({
      userPhone: phone,
      category: cat,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: "Category filter failed" });
  }
});

/* ================================
   Filter Favorites
================================ */
router.get("/favorites", async (req, res) => {
  try {
    const phone = req.userPhone;

    const data = await Content.find({
      userPhone: phone,
      isFavorite: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

/* ================================
   Random Inspiration
================================ */
router.get("/random", async (req, res) => {
  try {
    const phone = req.userPhone;

    const count = await Content.countDocuments({ userPhone: phone });

    if (count === 0) {
      return res.json({ message: "No content saved yet." });
    }

    const random = Math.floor(Math.random() * count);
    const item = await Content.findOne({ userPhone: phone }).skip(random).lean();

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Random fetch failed" });
  }
});

/* ================================
   Toggle Favorite
================================ */
router.patch("/favorite/:id", async (req, res) => {
  try {
    const phone = req.userPhone;

    const item = await Content.findOne({
      _id: req.params.id,
      userPhone: phone,
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({ isFavorite: item.isFavorite });
  } catch (error) {
    res.status(500).json({ error: "Toggle favorite failed" });
  }
});

/* ================================
   Update User Note
================================ */
router.patch("/note/:id", async (req, res) => {
  try {
    const phone = req.userPhone;
    const { note } = req.body;

    if (typeof note !== "string") {
      return res.status(400).json({ error: "Note must be a string" });
    }

    const item = await Content.findOneAndUpdate(
      { _id: req.params.id, userPhone: phone },
      { userNote: note.substring(0, 500) },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ userNote: item.userNote });
  } catch (error) {
    res.status(500).json({ error: "Note update failed" });
  }
});

/* ================================
   Mark as Read
================================ */
router.patch("/read/:id", async (req, res) => {
  try {
    const phone = req.userPhone;

    await Content.findOneAndUpdate(
      { _id: req.params.id, userPhone: phone },
      { readAt: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Mark read failed" });
  }
});

/* ================================
   Delete Single Item
================================ */
router.delete("/delete/:id", async (req, res) => {
  try {
    const phone = req.userPhone;

    const result = await Content.findOneAndDelete({
      _id: req.params.id,
      userPhone: phone, // Security: only owner can delete
    });

    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================================
   Delete All Content
================================ */
router.delete("/delete-all", async (req, res) => {
  try {
    const phone = req.userPhone;

    const result = await Content.deleteMany({ userPhone: phone });

    res.json({ message: `Deleted ${result.deletedCount} items` });
  } catch (error) {
    res.status(500).json({ error: "Delete all failed" });
  }
});

/* ================================
   Sidebar Chatbot RAG
================================ */
router.post("/chat", async (req, res) => {
  try {
    const phone = req.userPhone;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch up to 500 recent items to serve as RAG context
    const data = await Content.find({ userPhone: phone })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("url category caption aiSummary tags userNote -_id")
      .lean();

    const contextData = JSON.stringify(data);

    // Call Gemini Flash RAG function
    const reply = await answerQuestion(message, contextData);

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
