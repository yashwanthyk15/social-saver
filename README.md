# 🚀 Social Saver
❓ Problem Statement:

We all do it.You’re scrolling through Instagram and find a great workout, a design tip, or a coding hack.
You hit Save… and never open it again.
Saved content gets buried in hidden folders — lost, forgotten, and unused.

💡 Solution

📚 Turn your saved social media into an AI-powered personal knowledge base

Social Saver is an intelligent Telegram bot that transforms saved content into something you’ll actually use.

It:

📥 Accepts Instagram Reels, X (Twitter) posts, and blog links

🧠 Uses AI to analyze and categorize content

🔎 Stores everything in a searchable dashboard

📊 Helps you rediscover valuable content when you need it

No more forgotten saves.
Your knowledge — organized, searchable, and useful.

---


## 🌐 Live

🤖 **Telegram Bot:**  
https://t.me/social_saver_yk_bot

 A private dashboard will be generated when you click on start

**Explaination(video):**
https://drive.google.com/file/d/13XxL2ao0DGIGd6JLL5c8L2MpCJAh5xLN/view?usp=sharing

---

## ✨ Features

- 🤖 AI-powered content analysis (Gemini 2.5 Flash)
- 🧠 Sarcasm & meme-aware summarization
- 🏷 Dynamic smart categorization
- 🔐 User-isolated content storage
- 🔎 Search functionality
- 🗂 Category filtering
- 🎲 Random discovery feature
- ☁️ Fully deployed (Backend + Frontend)

---

## 🏗 System Architecture

### Flow Overview

1. **Telegram User**
2. **Telegram Bot API**
   - Webhook-based communication
3. **Express Backend (Node.js)**
   - Platform Detection  
   - Metadata Extraction (Microlink)  
   - AI Analysis (Gemini 2.5 Flash)  
   - Content Categorization
4. **MongoDB Atlas**
   - Stores metadata, analysis results, and categories
5. **REST API Layer**
6. **React Dashboard (Vite)**
   - Search  
   - Category Filter  
   - Random Discovery


---

## 🔄 User Flow

1️⃣ User opens Telegram bot  
2️⃣ Sends `/start`  
3️⃣ Sends a social media link  
4️⃣ Backend extracts metadata  
5️⃣ Gemini AI analyzes tone & meaning  
6️⃣ Content stored in MongoDB (user-isolated)  
7️⃣ Bot replies with:
   - Category  
   - AI summary  
   - Dashboard link  
8️⃣ User views saved content in dashboard  

---

## 🛠 Tech Stack

### 🔧 Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Gemini 2.5 Flash (Google Generative AI)

### 🎨 Frontend
- React (Vite)
- Axios
- Custom CSS

### ☁️ Deployment
- Render (Backend & Static Site)
- Telegram Bot API

---

## 🔐 Data Model

```json
{
  "userPhone": "telegram_chat_id",
  "url": "...",
  "caption": "...",
  "aiSummary": "...",
  "category": "...",
  "image": "...",
  "createdAt": "timestamp"
}











