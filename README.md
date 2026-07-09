# 🤖 Social Saver V3

An AI-powered personal knowledge base that lives directly in your Telegram app. Send any link, article, video, or post, and Social Saver will automatically extract, analyze, and categorize it for you, beautifully presented on a sleek Web Dashboard.

## ✨ Features

- **🧠 AI Summarization:** Automatically reads and summarizes long articles, YouTube videos, and social media posts using Google Gemini AI.
- **🏷 Smart Categorization:** AI automatically tags and categorizes your content so you don't have to organize anything manually.
- **📱 Telegram Integration:** No apps to install. Just forward or paste links directly into your personal Telegram bot.
- **🎨 Sleek Spatial UI:** A gorgeous, professional dark-mode web dashboard with glassmorphism, 3D interactive elements, and lightning-fast search.
- **🔒 Secure & Private:** Authenticate to your dashboard via secure magic links directly from your Telegram bot.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Framer Motion, Vanilla CSS (Professional Glassmorphism)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI Engine:** Google Gemini Pro (`@google/generative-ai`)
- **Bot Integration:** Telegram Bot API
- **Link Extraction:** Custom meta-scrapers and platform-specific resolvers

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (make sure your IP is whitelisted!)
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- A Google Gemini API Key

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# AI
GEMINI_API_KEY=your_gemini_api_key

# Database
MONGO_URI=mongodb+srv://user:password@cluster...

# Auth
JWT_SECRET=your_super_secret_jwt_key

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

### 3. Run Locally
**Install dependencies (Backend):**
```bash
npm install
```

**Install dependencies (Frontend):**
```bash
cd client
npm install
```

**Start the Development Servers:**
```bash
# Terminal 1 (Backend)
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```

The frontend will run on `http://localhost:5000` and proxy API requests to `http://localhost:3000`.

## 📱 How to Use
1. Send `/start` to your Telegram bot.
2. The bot will send you a secure magic link to access your dashboard.
3. Send any URL (YouTube, Twitter, Blogs) to the bot.
4. Watch the AI instantly analyze and save it to your web dashboard!

## 📄 License
MIT License
