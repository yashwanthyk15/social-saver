# 🚀 Social Saver

> 📚 Turn your saved social media into an AI-powered personal knowledge base.

Social Saver is an intelligent Telegram bot that converts Instagram Reels, X (Twitter) posts, and blog links into a searchable, categorized dashboard powered by AI.

It understands tone, sarcasm, meme culture, and multilingual content — then generates a concise English summary and stores it in a personal dashboard.

---

## 🌐 Live

🤖 **Telegram Bot:**  
https://t.me/YOUR_BOT_USERNAME  

📊 **Dashboard:**  
https://social-saver-frontend.onrender.com  

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
Telegram User
      │
      ▼
Telegram Bot API
      │ (Webhook)
      ▼
Express Backend (Node.js)
      ├── Platform Detection
      ├── Metadata Extraction (Microlink)
      ├── AI Analysis (Gemini 2.5 Flash)
      └── Content Categorization
      │
      ▼
MongoDB Atlas
      │ (REST API)
      ▼
React Dashboard (Vite)
      ├── Search
      ├── Category Filter
      └── Random Discovery


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

