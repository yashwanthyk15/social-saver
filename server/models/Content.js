const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    userPhone: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "twitter", "youtube", "reddit", "linkedin", "generic"],
      default: "generic",
    },
    caption: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Uncategorized",
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    userNote: {
      type: String,
      default: "",
      maxlength: 500,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  }
);

// Compound index for fast per-user queries
contentSchema.index({ userPhone: 1, createdAt: -1 });
contentSchema.index({ userPhone: 1, url: 1 }, { unique: true });

// Full-text search index
contentSchema.index({
  aiSummary: "text",
  caption: "text",
  category: "text",
  tags: "text",
  userNote: "text",
});

module.exports = mongoose.model("Content", contentSchema);
