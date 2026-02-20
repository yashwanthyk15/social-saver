const express = require("express");
const router = express.Router();
const Content = require("../models/Content");

/* =====================================================
   🔥 ADMIN: Get All Content
===================================================== */
router.get("/all", async (req, res) => {
  try {
    const data = await Content.find()
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all content" });
  }
});

/* =====================================================
   🔥 ADMIN: Get All Categories
===================================================== */
router.get("/categories", async (req, res) => {
  try {
    const categories = await Content.distinct("category");
    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/* =====================================================
   1️⃣ Get All Content for a User
===================================================== */
router.get("/all/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const data = await Content.find({ userPhone: phone })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

/* =====================================================
   5️⃣ Get All Unique Categories for User
===================================================== */
router.get("/categories/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const categories = await Content.distinct("category", {
      userPhone: phone
    });

    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;