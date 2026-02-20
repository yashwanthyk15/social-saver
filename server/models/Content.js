const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userPhone: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String
  },
  caption: {
    type: String
  },
  aiSummary: {
    type: String
  },
  category: {
    type: String
  },
  image: {
  type: String
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Content', contentSchema);
